const fs = require('fs');
const files = ['home', 'map', 'reservations', 'profile'];
for (const file of files) {
  const content = fs.readFileSync(file + '.html', 'utf8');
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    let bodyHtml = bodyMatch[1];
    
    // Replace href="#" to angular routerLink to prevent reload
    bodyHtml = bodyHtml.replace(/href="#"/g, `routerLink="/${file}"`);
    
    // Replace SVG images (e.g., shapes.svg) if exists... actually leave as is.
    
    // Wrap with ionic content
    const wrapper = `<ion-content fullscreen="true" scroll-y="false">\n  <div class="h-full w-full overflow-y-auto bg-background pb-32">\n${bodyHtml}\n  </div>\n</ion-content>`;
    
    fs.writeFileSync(`src/app/${file}/${file}.page.html`, wrapper, 'utf8');
    console.log(`Updated ${file}.page.html`);
  } else {
    console.error(`Could not find body tag in ${file}.html`);
  }
}
