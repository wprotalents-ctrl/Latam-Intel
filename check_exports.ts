import coinbase from 'coinbase-commerce-node';
console.log('Default keys:', Object.keys(coinbase));
if (coinbase.resources) {
  console.log('Resources keys:', Object.keys(coinbase.resources));
}
