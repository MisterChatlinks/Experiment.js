/**
 * The `baseProxy` object serves as a proxy manager for dynamically handling property access and 
 * manipulation within nested JavaScript objects. It is designed to manage objects and handlers 
 * for runtime configuration, retrieval, and modification of object properties, with support for 
 * custom callback functions based on specified predicates.
 *
 * The `baseProxy` object comprises:
 * - **init:** Initializes `baseProxy` with an array of objects to manage and handler functions 
 * that define specific conditions (predicates) and callbacks.
 * - **get:** Retrieves the value of a property within the target object, identified by the `target` 
 * parameter. If a `propertyPath` is provided, it retrieves the nested property using an array path.
 * If a handler’s predicate matches, its callback executes, and the process halts if `end` is set to `true`.
 * - **set:** Allows setting a new property on the proxy's `storage`.
 * - **storage:** A storage object containing `objects` and `handlers` for internal management.
 *
 * @param {object} obj - The `obj` parameter in `getNestedProperty` is the base object from which a 
 * nested property is retrieved. Within `baseProxy`, `obj` refers to `this.storage.objects[target]` 
 * where `target` is a specific object identifier.
 * 
 * @param {string[]} path - The `path` parameter in `getNestedProperty` is an array of keys representing 
 * the nested property path. For example, if you have an object like `{ a: { b: { c: "value" } } }`, 
 * the path `["a", "b", "c"]` would retrieve `"value"`.
 *
 * @returns {any} Depending on the handler and `propertyPath`, the `get` method returns a nested property 
 * value, the entire object, or invokes a callback based on the handler.
 */

/**
 * Function `getNestedProperty` dynamically accesses a nested property within an object based on a 
 * provided path array.
 *
 * @param {object} obj - The object to retrieve a property from.
 * @param {string[]} path - An array of keys representing the path to the nested property.
 * @returns {any} - The value at the nested property path or `undefined` if the path is invalid.
 */
function getNestedProperty(obj, path) {
    return path.reduce((acc, key) => acc && acc[key], obj);
}

const baseProxy = {
    /**
     * Initializes the `baseProxy` by populating the `storage` object with `objects` and `handlers`.
     * 
     * @param {Object} options - An options object for initialization.
     * @param {Object} options.objects - A set of objects to be managed by `baseProxy`.
     * @param {Array} options.handlers - An array of handler objects containing predicate and callback 
     * functions. Each handler can specify an `end` flag to stop further handler execution when true.
     */
    init: function({ objects, handlers }) {
        this.storage.objects = objects;
        this.storage.handlers = handlers;
    },

    /**
     * Retrieves a nested or direct property from a target object in `storage.objects`, based on a
     * provided `propertyPath` or `target`. If any handlers are defined, it iterates over them to 
     * check if they meet their predicate conditions for the target object.
     * 
     * If `propertyPath` is an array, `getNestedProperty` retrieves the nested property.
     * If no matching handlers are found, it proceeds to retrieve the property value directly.
     * 
     * @param {string} target - The key name of the object to retrieve from `storage.objects`.
     * @param {string | string[]} propertyPath - The path to the property to retrieve; can be an array 
     * for nested properties or a single key for direct access.
     * @returns {any} The value of the property or the result of a callback if a handler condition is met.
     */
    get: function(target, propertyPath) {
        // Check if handlers are defined and iterate over them
        for (let handler of this.storage.handlers) {
            if (handler.predicate(this.storage.objects[target])) {
                handler.callback();
                if (handler?.end === true) return; // Stop execution if callback is called
            }
        }

        // Warning if target is not defined in objects
        if (!this.storage.objects[target]) {
            console.warn("You are trying to access a property of an object that is not defined, Fallback on setting mode.");
            return this.set(target); // Call set if target not found
        }

        // Access the target's nested property dynamically using propertyPath array
        if (Array.isArray(propertyPath)) {
            return getNestedProperty(this.storage.objects[target], propertyPath);
        } else if (propertyPath) {
            return this.storage.objects[target][propertyPath];
        } else {
            return this.storage.objects[target];
        }
    },

    /**
     * Sets a property in `storage`. Primarily used for fallback when attempting to access a non-existent
     * target. Can be extended for setting properties dynamically if needed.
     * 
     * @param {string} propName - The name of the property to set in `storage`.
     * @returns {any} The value of the property in `storage`.
     */
    set: function(propName) {
        return this.storage[propName];
    },

    storage: {} // Contains the objects and handlers for internal use within `baseProxy`
};



const objects = {
    test: {
        subtest: {
            subSubText: "Hello World"
        }
    }
};

const handlers = [
    {
        predicate: (obj) => !!obj,
        callback: () => console.log("Predicate matched!")
    }
];

baseProxy.init({ objects, handlers });

console.log(baseProxy.get("test", ["subtest", "subSubText"])); // Output: "Hello World"

