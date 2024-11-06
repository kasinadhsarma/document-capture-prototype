const fs = require('fs');
const path = require('path');

// Define model architecture sizes
const sizes = {
  conv2d_kernel: [5, 5, 3, 8],    // 5x5 kernel, 3 input channels, 8 filters
  conv2d_bias: [8],               // 8 filters
  dense1_kernel: [12544, 32],     // Flattened conv output to 32 units
  dense1_bias: [32],              // 32 units
  dense2_kernel: [32, 3],         // 32 units to 3 classes
  dense2_bias: [3]                // 3 classes
};

// Calculate total number of weights
const totalWeights =
  sizes.conv2d_kernel.reduce((a, b) => a * b, 1) +
  sizes.conv2d_bias.reduce((a, b) => a * b, 1) +
  sizes.dense1_kernel.reduce((a, b) => a * b, 1) +
  sizes.dense1_bias.reduce((a, b) => a * b, 1) +
  sizes.dense2_kernel.reduce((a, b) => a * b, 1) +
  sizes.dense2_bias.reduce((a, b) => a * b, 1);

// Ensure the total is a multiple of 4 for Float32Array
const paddedTotal = Math.ceil(totalWeights / 4) * 4;

// Generate weights with Xavier initialization
function xavierInit(shape) {
  const n = shape.reduce((a, b) => a * b, 1);
  const limit = Math.sqrt(6 / n);
  return new Float32Array(n).map(() => (Math.random() * 2 - 1) * limit);
}

// Generate all weights
const weights = new Float32Array(paddedTotal);
let offset = 0;

// Conv2D kernel
const conv2dKernel = xavierInit(sizes.conv2d_kernel);
weights.set(conv2dKernel, offset);
offset += conv2dKernel.length;

// Conv2D bias
const conv2dBias = new Float32Array(sizes.conv2d_bias[0]).fill(0.1);
weights.set(conv2dBias, offset);
offset += conv2dBias.length;

// Dense1 kernel
const dense1Kernel = xavierInit(sizes.dense1_kernel);
weights.set(dense1Kernel, offset);
offset += dense1Kernel.length;

// Dense1 bias
const dense1Bias = new Float32Array(sizes.dense1_bias[0]).fill(0.1);
weights.set(dense1Bias, offset);
offset += dense1Bias.length;

// Dense2 kernel
const dense2Kernel = xavierInit(sizes.dense2_kernel);
weights.set(dense2Kernel, offset);
offset += dense2Kernel.length;

// Dense2 bias
const dense2Bias = new Float32Array(sizes.dense2_bias[0]).fill(0.1);
weights.set(dense2Bias, offset);
offset += dense2Bias.length;

// Write weights to file
const outputPath = path.join(__dirname, '../../public/models/document_classifier_cpu.weights.bin');
fs.writeFileSync(outputPath, Buffer.from(weights.buffer));

console.log(`Generated weights file with ${paddedTotal} values (${weights.byteLength} bytes)`);
