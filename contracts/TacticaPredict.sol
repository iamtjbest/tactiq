// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TacticaPredict — Football formation prediction pool on Celo
/// @notice Users stake USDm on which formation a team will use. Winners share the pot.
/// @dev Deployed on Celo Mainnet (Chain ID: 42220). USDm has 18 decimals.

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract TacticaPredict {
    // USDm (cUSD) on Celo Mainnet — 18 decimals
    IERC20 public constant USDm = IERC20(0x765DE816845861e75A25fCA122bb6898B8B1282a);

    address public owner;
    uint256 public constant FEE_BPS = 500;       // 5% protocol fee
    uint256 public constant MIN_STAKE = 0.5e18;  // Minimum 0.50 USDm (18 dec)
    uint256 public constant MAX_STAKE = 10e18;   // Maximum 10.00 USDm per prediction

    struct Prediction {
        address user;
        string  formation; // e.g. "4-3-3"
        uint256 stake;     // in USDm wei (18 decimals)
    }

    struct Match {
        string       homeTeam;
        string       awayTeam;
        uint256      kickoffAt;    // Unix timestamp
        bool         settled;
        bool         cancelled;
        string       winningFormation;
        uint256      totalPool;
        Prediction[] predictions;
    }

    mapping(uint256 => Match) private _matches;
    uint256 public matchCount;
    uint256 public totalFeesCollected;

    // ── Events ────────────────────────────────────────────────────────────────

    event MatchCreated(uint256 indexed matchId, string homeTeam, string awayTeam, uint256 kickoffAt);
    event PredictionMade(uint256 indexed matchId, address indexed user, string formation, uint256 stake);
    event MatchSettled(uint256 indexed matchId, string winningFormation, uint256 totalPool, uint256 winnersCount);
    event MatchCancelled(uint256 indexed matchId);
    event FeeWithdrawn(address to, uint256 amount);

    // ── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ── Owner functions ───────────────────────────────────────────────────────

    /// @notice Create an upcoming match that users can predict on
    function createMatch(
        string calldata homeTeam,
        string calldata awayTeam,
        uint256 kickoffAt
    ) external onlyOwner returns (uint256 matchId) {
        require(kickoffAt > block.timestamp, "Kickoff must be in the future");
        matchId = matchCount++;
        Match storage m = _matches[matchId];
        m.homeTeam  = homeTeam;
        m.awayTeam  = awayTeam;
        m.kickoffAt = kickoffAt;
        emit MatchCreated(matchId, homeTeam, awayTeam, kickoffAt);
    }

    /// @notice Settle a match with the actual formation used by the home team
    function settleMatch(uint256 matchId, string calldata winningFormation) external onlyOwner {
        Match storage m = _matches[matchId];
        require(!m.settled,   "Already settled");
        require(!m.cancelled, "Match cancelled");

        m.settled          = true;
        m.winningFormation = winningFormation;

        uint256 pool = m.totalPool;
        if (pool == 0) {
            emit MatchSettled(matchId, winningFormation, 0, 0);
            return;
        }

        uint256 fee   = (pool * FEE_BPS) / 10_000;
        uint256 prize = pool - fee;
        totalFeesCollected += fee;

        // Tally winners' stake
        uint256 winnersStake  = 0;
        uint256 winnersCount  = 0;
        bytes32 winHash = keccak256(bytes(winningFormation));
        for (uint256 i = 0; i < m.predictions.length; i++) {
            if (keccak256(bytes(m.predictions[i].formation)) == winHash) {
                winnersStake += m.predictions[i].stake;
                winnersCount++;
            }
        }

        if (winnersStake > 0) {
            // Proportional payout to winners
            for (uint256 i = 0; i < m.predictions.length; i++) {
                if (keccak256(bytes(m.predictions[i].formation)) == winHash) {
                    uint256 payout = (m.predictions[i].stake * prize) / winnersStake;
                    USDm.transfer(m.predictions[i].user, payout);
                }
            }
        } else {
            // No winners — return prize to fee pool (house keeps all)
            totalFeesCollected += prize;
        }

        emit MatchSettled(matchId, winningFormation, pool, winnersCount);
    }

    /// @notice Cancel a match and refund all stakers
    function cancelMatch(uint256 matchId) external onlyOwner {
        Match storage m = _matches[matchId];
        require(!m.settled,   "Already settled");
        require(!m.cancelled, "Already cancelled");
        m.cancelled = true;

        // Refund everyone
        for (uint256 i = 0; i < m.predictions.length; i++) {
            USDm.transfer(m.predictions[i].user, m.predictions[i].stake);
        }
        emit MatchCancelled(matchId);
    }

    /// @notice Withdraw accumulated protocol fees
    function withdrawFees(address to) external onlyOwner {
        uint256 amount = totalFeesCollected;
        totalFeesCollected = 0;
        USDm.transfer(to, amount);
        emit FeeWithdrawn(to, amount);
    }

    /// @notice Transfer ownership
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }

    // ── User functions ────────────────────────────────────────────────────────

    /// @notice Stake USDm on a formation prediction
    /// @param matchId    The match to predict on
    /// @param formation  Formation string, e.g. "4-3-3"
    /// @param stakeAmt   Amount in USDm wei (18 decimals), e.g. 1e18 = 1 USDm
    function predict(
        uint256 matchId,
        string calldata formation,
        uint256 stakeAmt
    ) external {
        Match storage m = _matches[matchId];
        require(!m.settled,               "Match already settled");
        require(!m.cancelled,             "Match cancelled");
        require(block.timestamp < m.kickoffAt, "Predictions closed");
        require(stakeAmt >= MIN_STAKE,    "Below minimum stake (0.50 USDm)");
        require(stakeAmt <= MAX_STAKE,    "Above maximum stake (10 USDm)");
        require(bytes(formation).length > 0, "Empty formation");

        require(
            USDm.transferFrom(msg.sender, address(this), stakeAmt),
            "USDm transfer failed — check allowance"
        );

        m.predictions.push(Prediction({
            user:      msg.sender,
            formation: formation,
            stake:     stakeAmt
        }));
        m.totalPool += stakeAmt;

        emit PredictionMade(matchId, msg.sender, formation, stakeAmt);
    }

    // ── View functions ────────────────────────────────────────────────────────

    function getMatch(uint256 matchId) external view returns (
        string memory homeTeam,
        string memory awayTeam,
        uint256 kickoffAt,
        bool settled,
        bool cancelled,
        string memory winningFormation,
        uint256 totalPool,
        uint256 predictionCount
    ) {
        Match storage m = _matches[matchId];
        return (
            m.homeTeam,
            m.awayTeam,
            m.kickoffAt,
            m.settled,
            m.cancelled,
            m.winningFormation,
            m.totalPool,
            m.predictions.length
        );
    }

    function getPrediction(uint256 matchId, uint256 index) external view returns (
        address user,
        string memory formation,
        uint256 stake
    ) {
        Prediction storage p = _matches[matchId].predictions[index];
        return (p.user, p.formation, p.stake);
    }

    function getFormationPool(uint256 matchId, string calldata formation) external view returns (uint256 total) {
        bytes32 fHash = keccak256(bytes(formation));
        Match storage m = _matches[matchId];
        for (uint256 i = 0; i < m.predictions.length; i++) {
            if (keccak256(bytes(m.predictions[i].formation)) == fHash) {
                total += m.predictions[i].stake;
            }
        }
    }

    function getUserPredictions(uint256 matchId, address user) external view returns (
        string[] memory formations,
        uint256[] memory stakes
    ) {
        Match storage m = _matches[matchId];
        uint256 count = 0;
        for (uint256 i = 0; i < m.predictions.length; i++) {
            if (m.predictions[i].user == user) count++;
        }
        formations = new string[](count);
        stakes     = new uint256[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < m.predictions.length; i++) {
            if (m.predictions[i].user == user) {
                formations[j] = m.predictions[i].formation;
                stakes[j]     = m.predictions[i].stake;
                j++;
            }
        }
    }
}
