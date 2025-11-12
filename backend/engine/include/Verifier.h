#ifndef VERIFIER_H
#define VERIFIER_H

#include <string>
#include <vector>
#include <map>
#include <set>
#include <memory>
#include <unordered_map>

namespace ReactiveSystem
{

    // Forward declarations
    struct State;
    struct Transition;
    struct StateMachine;

    /**
     * Result of reachability analysis
     */
    struct ReachabilityResult
    {
        bool isReachable;
        std::vector<std::string> path;
        std::string message;
    };

    /**
     * Result of invariant checking
     */
    struct InvariantCheckResult
    {
        bool holds;
        std::string failingState;
        std::vector<std::string> failingPath;
        std::string message;
    };

    /**
     * Safety verification engine
     * Performs reachability analysis, invariant checking, and deadlock detection
     */
    class Verifier
    {
    public:
        /**
         * Check if a state is reachable from initial state
         */
        static ReachabilityResult isStateReachable(
            const StateMachine &machine,
            const std::string &targetStateId);

        /**
         * Get all reachable states from initial state
         */
        static std::vector<std::string> getReachableStates(
            const StateMachine &machine);

        /**
         * Check if a state is deadlock (no outgoing transitions)
         */
        static bool isDeadlock(
            const StateMachine &machine,
            const std::string &stateId);

        /**
         * Find all deadlock states
         */
        static std::vector<std::string> findDeadlocks(
            const StateMachine &machine);

        /**
         * Check if a state is livelock (can only loop to itself)
         */
        static bool isLivelock(
            const StateMachine &machine,
            const std::string &stateId);

        /**
         * Simple invariant checking - evaluates boolean expressions
         * Supports: state.name, state.id comparisons
         * Example: "currentState != dead_state"
         */
        static InvariantCheckResult checkInvariant(
            const StateMachine &machine,
            const std::string &invariantExpression);

        /**
         * Check if machine can reach a final state from initial state
         */
        static ReachabilityResult canReachFinalState(
            const StateMachine &machine);

        /**
         * Generate detailed verification report
         */
        struct VerificationReport
        {
            bool isValid;
            std::vector<std::string> errors;
            std::vector<std::string> warnings;
            int reachableStates;
            int totalStates;
            std::vector<std::string> deadlocks;
            std::string summary;
        };

        static VerificationReport generateReport(
            const StateMachine &machine);

    private:
        /**
         * BFS helper for reachability
         */
        static std::set<std::string> reachableStatesBFS(
            const StateMachine &machine);

        /**
         * Parse and evaluate simple invariant expressions
         */
        static bool evaluateExpression(
            const std::string &expression,
            const StateMachine &machine,
            const std::string &currentStateId);
    };

} // namespace ReactiveSystem

#endif // VERIFIER_H
