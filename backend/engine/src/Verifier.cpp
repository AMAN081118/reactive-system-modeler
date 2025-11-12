#include "../include/Verifier.h"
#include "MealyMachine.h"
#include <algorithm>
#include <queue>
#include <sstream>

namespace ReactiveSystem
{

    /**
     * BFS to find all reachable states
     */
    std::set<std::string> Verifier::reachableStatesBFS(const StateMachine &machine)
    {
        std::set<std::string> reachable;
        std::queue<std::string> queue;

        // Find initial state
        std::string initialStateId;
        for (const auto &state : machine.states)
        {
            if (state.isInitial)
            {
                initialStateId = state.id;
                break;
            }
        }

        if (initialStateId.empty())
        {
            return reachable; // No initial state
        }

        queue.push(initialStateId);
        reachable.insert(initialStateId);

        while (!queue.empty())
        {
            std::string currentStateId = queue.front();
            queue.pop();

            // Find all outgoing transitions
            for (const auto &transition : machine.transitions)
            {
                if (transition.from == currentStateId)
                {
                    if (reachable.find(transition.to) == reachable.end())
                    {
                        reachable.insert(transition.to);
                        queue.push(transition.to);
                    }
                }
            }
        }

        return reachable;
    }

    /**
     * Check if a specific state is reachable
     */
    ReachabilityResult Verifier::isStateReachable(
        const StateMachine &machine,
        const std::string &targetStateId)
    {
        ReachabilityResult result;
        result.isReachable = false;
        result.message = "State not reachable";

        auto reachable = reachableStatesBFS(machine);

        if (reachable.find(targetStateId) != reachable.end())
        {
            result.isReachable = true;
            result.message = "State is reachable";
        }
        else
        {
            result.message = "State is not reachable from initial state";
        }

        return result;
    }

    /**
     * Get all reachable states
     */
    std::vector<std::string> Verifier::getReachableStates(const StateMachine &machine)
    {
        auto reachableSet = reachableStatesBFS(machine);
        return std::vector<std::string>(reachableSet.begin(), reachableSet.end());
    }

    /**
     * Check if state is deadlock (no outgoing transitions)
     */
    bool Verifier::isDeadlock(const StateMachine &machine, const std::string &stateId)
    {
        for (const auto &transition : machine.transitions)
        {
            if (transition.from == stateId)
            {
                return false; // Has at least one outgoing transition
            }
        }
        return true; // No outgoing transitions = deadlock
    }

    /**
     * Find all deadlock states
     */
    std::vector<std::string> Verifier::findDeadlocks(const StateMachine &machine)
    {
        std::vector<std::string> deadlocks;

        for (const auto &state : machine.states)
        {
            if (isDeadlock(machine, state.id) && !state.isFinal)
            {
                deadlocks.push_back(state.id);
            }
        }

        return deadlocks;
    }

    /**
     * Check if state is livelock (loops only to itself)
     */
    bool Verifier::isLivelock(const StateMachine &machine, const std::string &stateId)
    {
        for (const auto &transition : machine.transitions)
        {
            if (transition.from == stateId && transition.to != stateId)
            {
                return false; // Has transition to other state
            }
        }
        return true; // Only self-loops
    }

    /**
     * Simple expression evaluator for invariants
     */
    bool Verifier::evaluateExpression(
        const std::string &expression,
        const StateMachine &machine,
        const std::string &currentStateId)
    {
        // Get current state
        const auto *currentState = nullptr;
        for (const auto &state : machine.states)
        {
            if (state.id == currentStateId)
            {
                currentState = &state;
                break;
            }
        }

        if (!currentState)
        {
            return false;
        }

        // Simple pattern matching for common expressions
        // Example: "state != dead" or "state == idle"

        if (expression.find("!=") != std::string::npos)
        {
            // Not equal check
            std::istringstream iss(expression);
            std::string state, op, value;
            iss >> state >> op >> value;

            return currentState->name != value;
        }

        if (expression.find("==") != std::string::npos)
        {
            // Equal check
            std::istringstream iss(expression);
            std::string state, op, value;
            iss >> state >> op >> value;

            return currentState->name == value;
        }

        // Default: assume true if no pattern matches
        return true;
    }

    /**
     * Check invariant on all reachable states
     */
    InvariantCheckResult Verifier::checkInvariant(
        const StateMachine &machine,
        const std::string &invariantExpression)
    {
        InvariantCheckResult result;
        result.holds = true;
        result.message = "Invariant holds on all reachable states";

        auto reachableStates = getReachableStates(machine);

        for (const auto &stateId : reachableStates)
        {
            if (!evaluateExpression(invariantExpression, machine, stateId))
            {
                result.holds = false;
                result.failingState = stateId;
                result.failingPath.push_back(stateId);
                result.message = "Invariant violated at state: " + stateId;
                return result;
            }
        }

        return result;
    }

    /**
     * Check if final state is reachable
     */
    ReachabilityResult Verifier::canReachFinalState(const StateMachine &machine)
    {
        ReachabilityResult result;
        result.isReachable = false;
        result.message = "No final state reachable";

        auto reachable = reachableStatesBFS(machine);

        for (const auto &state : machine.states)
        {
            if (state.isFinal && reachable.find(state.id) != reachable.end())
            {
                result.isReachable = true;
                result.message = "Final state '" + state.name + "' is reachable";
                return result;
            }
        }

        return result;
    }

    /**
     * Generate comprehensive verification report
     */
    VerificationReport Verifier::generateReport(const StateMachine &machine)
    {
        VerificationReport report;
        report.isValid = true;

        // Check initial state
        int initialCount = 0;
        for (const auto &state : machine.states)
        {
            if (state.isInitial)
            {
                initialCount++;
            }
        }

        if (initialCount == 0)
        {
            report.isValid = false;
            report.errors.push_back("ERROR: No initial state defined");
        }
        else if (initialCount > 1)
        {
            report.isValid = false;
            report.errors.push_back("ERROR: Multiple initial states defined");
        }

        // Check transitions
        for (const auto &transition : machine.transitions)
        {
            bool fromExists = false, toExists = false;

            for (const auto &state : machine.states)
            {
                if (state.id == transition.from)
                    fromExists = true;
                if (state.id == transition.to)
                    toExists = true;
            }

            if (!fromExists)
            {
                report.isValid = false;
                report.errors.push_back("ERROR: Transition from non-existent state: " + transition.from);
            }
            if (!toExists)
            {
                report.isValid = false;
                report.errors.push_back("ERROR: Transition to non-existent state: " + transition.to);
            }
        }

        // Reachability analysis
        auto reachable = getReachableStates(machine);
        report.reachableStates = reachable.size();
        report.totalStates = machine.states.size();

        if (report.reachableStates < report.totalStates)
        {
            for (const auto &state : machine.states)
            {
                if (std::find(reachable.begin(), reachable.end(), state.id) == reachable.end())
                {
                    report.warnings.push_back("WARNING: Unreachable state: " + state.name);
                }
            }
        }

        // Deadlock detection
        report.deadlocks = findDeadlocks(machine);
        if (!report.deadlocks.empty())
        {
            for (const auto &deadlock : report.deadlocks)
            {
                report.warnings.push_back("WARNING: Potential deadlock state: " + deadlock);
            }
        }

        // Check final state reachability
        auto finalReachable = canReachFinalState(machine);
        if (!finalReachable.isReachable)
        {
            report.warnings.push_back("WARNING: No final state is reachable");
        }

        // Generate summary
        std::ostringstream summary;
        summary << "States: " << report.totalStates << " (Reachable: " << report.reachableStates
                << ")"
                << " | Transitions: " << machine.transitions.size()
                << " | Status: " << (report.isValid ? "VALID" : "INVALID");

        report.summary = summary.str();

        return report;
    }

} // namespace ReactiveSystem
