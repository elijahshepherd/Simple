import { Interpreter, ReturnValue } from './dist/interpreter.js';

async function test() {
  const interpreter = new Interpreter();
  
  // Test 1: Direct throw and catch
  try {
    throw new ReturnValue(42);
  } catch (e) {
    console.log('Test 1 - Direct catch:');
    console.log('  e:', e);
    console.log('  e instanceof ReturnValue:', e instanceof ReturnValue);
    console.log('  e.value:', e.value);
  }

  // Test 2: Through async function
  async function testAsync() {
    try {
      throw new ReturnValue(99);
    } catch (e) {
      if (e instanceof ReturnValue) {
        return e.value;
      }
      throw e;
    }
  }
  
  const result = await testAsync();
  console.log('Test 2 - Async function return:', result);
}

test().then(() => console.log('Done')).catch(e => console.error('Error:', e));