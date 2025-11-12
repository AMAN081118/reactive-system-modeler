#include <napi.h>
#include "../engine/include/Verifier.h"
#include "../engine/include/MealyMachine.h"
#include <vector>
#include <string>

using namespace ReactiveSystem;
using namespace Napi;

/**
 * Convert JS StateMachine object to C++ struct
 */
StateMachine convertJSStateMachine(const Object &jsStateMachine)
{
    StateMachine machine;
    machine.id = jsStateMachine.Get("id").As<String>().Utf8Value();
    machine.name = jsStateMachine.Get("name").As<String>().Utf8Value();
    machine.type = jsStateMachine.Get("type").As<String>().Utf8Value() == "mealy" ? "mealy" : "moore";

    // Convert states
    Array statesArray = jsStateMachine.Get("states").As<Array>();
    for (uint32_t i = 0; i < statesArray.Length(); i++)
    {
        Object stateObj = statesArray.Get(i).As<Object>();
        State state;
        state.id = stateObj.Get("id").As<String>().Utf8Value();
        state.name = stateObj.Get("name").As<String>().Utf8Value();
        state.isInitial = stateObj.Get("isInitial").As<Boolean>();
        state.isFinal = stateObj.Get("isFinal").As<Boolean>();
        machine.states.push_back(state);
    }

    // Convert transitions
    Array transitionsArray = jsStateMachine.Get("transitions").As<Array>();
    for (uint32_t i = 0; i < transitionsArray.Length(); i++)
    {
        Object transObj = transitionsArray.Get(i).As<Object>();
        Transition transition;
        transition.id = transObj.Get("id").As<String>().Utf8Value();
        transition.from = transObj.Get("from").As<String>().Utf8Value();
        transition.to = transObj.Get("to").As<String>().Utf8Value();

        // Optional fields
        if (!transObj.Get("input").IsUndefined())
        {
            transition.input = transObj.Get("input").As<String>().Utf8Value();
        }
        if (!transObj.Get("output").IsUndefined())
        {
            transition.output = transObj.Get("output").As<String>().Utf8Value();
        }

        machine.transitions.push_back(transition);
    }

    return machine;
}

/**
 * Verify state machine
 */
Value VerifyStateMachine(const CallbackInfo &info)
{
    Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsObject())
    {
        TypeError::New(env, "State machine object expected").ThrowAsJavaScriptException();
        return env.Null();
    }

    try
    {
        Object jsStateMachine = info[0].As<Object>();
        StateMachine machine = convertJSStateMachine(jsStateMachine);

        auto report = Verifier::generateReport(machine);

        // Create result object
        Object result = Object::New(env);
        result.Set("isValid", Boolean::New(env, report.isValid));
        result.Set("reachableStates", Number::New(env, report.reachableStates));
        result.Set("totalStates", Number::New(env, report.totalStates));
        result.Set("summary", String::New(env, report.summary));

        // Add errors array
        Array errorsArray = Array::New(env);
        for (size_t i = 0; i < report.errors.size(); i++)
        {
            errorsArray.Set(i, String::New(env, report.errors[i]));
        }
        result.Set("errors", errorsArray);

        // Add warnings array
        Array warningsArray = Array::New(env);
        for (size_t i = 0; i < report.warnings.size(); i++)
        {
            warningsArray.Set(i, String::New(env, report.warnings[i]));
        }
        result.Set("warnings", warningsArray);

        // Add deadlocks array
        Array deadlocksArray = Array::New(env);
        for (size_t i = 0; i < report.deadlocks.size(); i++)
        {
            deadlocksArray.Set(i, String::New(env, report.deadlocks[i]));
        }
        result.Set("deadlocks", deadlocksArray);

        return result;
    }
    catch (const std::exception &e)
    {
        TypeError::New(env, std::string("C++ Error: ") + e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

/**
 * Check reachability
 */
Value CheckReachability(const CallbackInfo &info)
{
    Env env = info.Env();

    if (info.Length() < 2)
    {
        TypeError::New(env, "State machine and target state ID expected").ThrowAsJavaScriptException();
        return env.Null();
    }

    try
    {
        Object jsStateMachine = info[0].As<Object>();
        std::string targetStateId = info[1].As<String>().Utf8Value();

        StateMachine machine = convertJSStateMachine(jsStateMachine);
        auto result = Verifier::isStateReachable(machine, targetStateId);

        Object jsResult = Object::New(env);
        jsResult.Set("isReachable", Boolean::New(env, result.isReachable));
        jsResult.Set("message", String::New(env, result.message));

        return jsResult;
    }
    catch (const std::exception &e)
    {
        TypeError::New(env, std::string("C++ Error: ") + e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

/**
 * Find deadlocks
 */
Value FindDeadlocks(const CallbackInfo &info)
{
    Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsObject())
    {
        TypeError::New(env, "State machine object expected").ThrowAsJavaScriptException();
        return env.Null();
    }

    try
    {
        Object jsStateMachine = info[0].As<Object>();
        StateMachine machine = convertJSStateMachine(jsStateMachine);

        auto deadlocks = Verifier::findDeadlocks(machine);

        Array result = Array::New(env);
        for (size_t i = 0; i < deadlocks.size(); i++)
        {
            result.Set(i, String::New(env, deadlocks[i]));
        }

        return result;
    }
    catch (const std::exception &e)
    {
        TypeError::New(env, std::string("C++ Error: ") + e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

/**
 * Module initialization
 */
Object Init(Env env, Object exports)
{
    exports.Set("verifyStateMachine", Function::New(env, VerifyStateMachine));
    exports.Set("checkReachability", Function::New(env, CheckReachability));
    exports.Set("findDeadlocks", Function::New(env, FindDeadlocks));

    return exports;
}

NODE_API_MODULE(verifier, Init)
