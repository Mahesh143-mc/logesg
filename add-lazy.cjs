const fs = require('fs');
const files = [
  'src/pages/customer/CustomerContact.tsx',
  'src/pages/customer/CustomerReviews.tsx',
  'src/pages/customer/CustomerShop.tsx',
  'src/components/customer/home/ParallaxShowcase.tsx',
  'src/components/customer/home/FeaturedProducts.tsx',
  'src/components/customer/home/HeritageSection.tsx'
];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const updated = content.replace(/<img /g, '<img loading="lazy" ');
  fs.writeFileSync(f, updated);
});
console.log('Done');
