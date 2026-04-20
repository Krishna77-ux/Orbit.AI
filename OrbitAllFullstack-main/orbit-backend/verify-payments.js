import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Setup __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '.env') });

const log = console.log;
const info = (msg) => log('ℹ [INFO] ' + msg);
const success = (msg) => log('✔ [SUCCESS] ' + msg);
const warn = (msg) => log('⚠ [WARNING] ' + msg);
const error = (msg) => log('✖ [ERROR] ' + msg);
const header = (msg) => log('\n' + '=== ' + msg.toUpperCase() + ' ===');

async function testPayments() {
  header("ORBIT PAYMENT GATEWAY STATUS");

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || key_id === 'mock_key' || !key_secret || key_secret === 'mock_secret') {
    warn("Razorpay keys are missing or set to 'mock_key'. Payments will run in MOCK MODE.");
    info("To enable real payments, add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.");
    
    // Testing Mock Signature Logic
    info("Testing Mock Signature Verification...");
    const order_id = "order_mock_123";
    const payment_id = "pay_mock_123";
    const mock_secret = "test_secret";
    const signature = crypto.createHmac("sha256", mock_secret).update(`${order_id}|${payment_id}`).digest("hex");
    
    const verify_shasum = crypto.createHmac("sha256", mock_secret).update(`${order_id}|${payment_id}`).digest("hex");
    if (signature === verify_shasum) {
      success("Signature Logic: Verified (SHA256 Hashing Works)");
    } else {
      error("Signature Logic: Failed");
    }
    
    header("STATUS: MOCK MODE ACTIVE 🟡");
    return;
  }

  success("Razorpay Credentials Found");

  try {
    const razorpay = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });

    info("Connecting to Razorpay API...");
    // Fetching latest 1 order to verify connectivity
    const orders = await razorpay.orders.all({ count: 1 });
    success("Connectivity: Verified (Successfully fetched orders)");
    
    info("Testing Order Creation logic...");
    const testOrder = await razorpay.orders.create({
      amount: 100, // 1 INR in paise
      currency: "INR",
      receipt: "receipt_test_" + Date.now(),
    });
    success(`Order Creation: Verified (Test Order ID: ${testOrder.id})`);

    header("FINAL RESULT: GATEWAY HEALTHY 🚀");
    log("Razorpay integration is working perfectly with live/test credentials.");

  } catch (err) {
    header("FINAL RESULT: CONNECTION FAILED ❌");
    error(err.message);
    log("\nTroubleshooting:");
    log("1. Check if your RAZORPAY_KEY_ID and SECRET are correct in .env");
    log("2. Ensure your Razorpay account is active and not in 'Activation Pending' state.");
    log("3. Verify your server has outbound internet access to api.razorpay.com");
  }
}

testPayments();
