function getNestedProperty(obj, path) {
    return path.reduce((acc, key) => acc && acc[key], obj);
}

const baseProxy = {
    init: function({ objects, handlers }) {
        this.storage.objects = objects;
        this.storage.handlers = handlers;
    },
    
    get: function(target, propertyPath) {
        // Check if handlers are defined and iterate over them
        for (let handler of this.storage.handlers) {
            if (handler.predicate(this.storage.objects[target])) {
                handler.callback();
                if(handler?.end === true) return; // Stop execution if callback is called
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
    
    set: function(propName) {
        return this.storage[propName];
    },
    
    storage: {}
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

