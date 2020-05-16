// @ts-check
/**
 * @param {number} x 
 * @return {number} 
 */
function f(x) { return x * 2; }

f(7); // This is an error

// f("samer");

/**
 * @param {string} [somebody]
 */
function sayHello(somebody) {
    if (!somebody) {
        somebody = "John Doe";
    }
    console.log("Hello " + somebody);
}

sayHello();