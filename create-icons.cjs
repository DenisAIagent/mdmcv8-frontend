// Créer des SVG simples pour les icônes
const youtubeIcon = `<svg width="35" height="35" viewBox="0 0 24 24" fill="#E50914" xmlns="http://www.w3.org/2000/svg">
  <path d="M21.543 6.498C22 8.28 22 12 22 12C22 12 22 15.72 21.543 17.502C21.289 18.487 20.546 19.262 19.605 19.524C17.896 20 12 20 12 20C12 20 6.107 20 4.395 19.524C3.45 19.258 2.708 18.484 2.457 17.502C2 15.72 2 12 2 12C2 12 2 8.28 2.457 6.498C2.711 5.513 3.454 4.738 4.395 4.476C6.107 4 12 4 12 4C12 4 17.896 4 19.605 4.476C20.55 4.742 21.292 5.516 21.543 6.498ZM10 15.5L16 12L10 8.5V15.5Z" />
</svg>`;

const metaIcon = `<svg width="35" height="35" viewBox="0 0 24 24" fill="#E50914" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
</svg>`;

const tiktokIcon = `<svg width="35" height="35" viewBox="0 0 24 24" fill="#E50914" xmlns="http://www.w3.org/2000/svg">
  <path d="M16.6 5.82C15.9165 5.03962 15.5397 4.03743 15.54 3H12.45V15.4C12.4262 16.071 12.1429 16.7066 11.6598 17.1729C11.1767 17.6393 10.5297 17.8999 9.85999 17.9C8.43999 17.9 7.29999 16.77 7.29999 15.35C7.29999 13.93 8.42999 12.8 9.84999 12.8C10.1399 12.8 10.4199 12.85 10.6799 12.95V9.8C10.2056 9.71596 9.72305 9.67857 9.23999 9.69C8.41593 9.69151 7.60232 9.8681 6.86334 10.2065C6.12435 10.5449 5.47674 11.0358 4.96946 11.6427C4.46217 12.2497 4.10566 12.9596 3.92747 13.7177C3.74928 14.4759 3.75366 15.2644 3.93999 16.02C4.2613 17.5298 5.1227 18.8814 6.36 19.79C7.5973 20.6986 9.12328 21.1177 10.65 20.97C12.1767 20.8223 13.5986 20.1192 14.6718 19.0007C15.745 17.8822 16.3906 16.4325 16.48 14.9V9.15C17.74 10.04 19.27 10.5 20.85 10.5V7.4C20.85 7.4 18.5 7.45 16.6 5.82Z" />
</svg>`;

const contentIcon = `<svg width="35" height="35" viewBox="0 0 24 24" fill="#E50914" xmlns="http://www.w3.org/2000/svg">
  <path d="M19 5V19H5V5H19ZM21 3H3V21H21V3ZM17 17H7V16H17V17ZM17 15H7V14H17V15ZM17 12H7V7H17V12Z" />
</svg>`;

// Créer les fichiers SVG
const createSvgFile = (content, filename) => {
  const fs = require('fs');
  fs.writeFileSync(filename, content);
};

// Exporter les icônes
createSvgFile(youtubeIcon, 'public/assets/images/youtube-icon.svg');
createSvgFile(metaIcon, 'public/assets/images/meta-icon.svg');
createSvgFile(tiktokIcon, 'public/assets/images/tiktok-icon.svg');
createSvgFile(contentIcon, 'public/assets/images/content-icon.svg');

console.log('Icônes SVG créées avec succès!');
