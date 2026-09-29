async function check() {
  const res = await fetch('https://potato-sim.vercel.app/assets/index-CmBxdhiY.js');
  const js = await res.text();
  const urls = js.match(/https:\/\/[a-z0-9.]+/g) || [];
  console.log('URLs in bundle:', Array.from(new Set(urls)));
  
  // Find player modal code
  const hasSubmit = js.includes('handleSubmit');
  console.log('hasSubmit:', hasSubmit);
  const pwMatch = js.match(/password_hash[^,;]+/g);
  console.log('pwMatch:', pwMatch);
}
check();
