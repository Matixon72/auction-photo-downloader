import fetch from 'node-fetch';
import { html, load } from 'cheerio';
import fs from 'fs';
import { fileURLToPath, URL } from 'url';
import path from 'path';
import readline from 'readline';

const modulePath = fileURLToPath(import.meta.url);



async function getProductHTML(url) {
  let options = {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/108.0',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      Referer: 'https://allegro.pl',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
      TE: 'trailers',
    }};
  const response = await fetch(url,options);
  const htmlData = await response.text();
  return htmlData;
}

async function getImageUrlsFromHTML(url) {
  const htmlText = await getProductHTML(url);
  const imageUrls = [];
  const images = [];
  const site = load(htmlText);
  const title = site('h4.mp0t_ji').text();
  site('._e5e62_d3wWH').each((i, image) => {
    imageUrls.push(image.attribs.src);
  });
  imageUrls.forEach((e) => {
    images.push(e.replace('/s128/','/original/'))
  });
  const productTitleImages = {
    title,
    images
  }
  return productTitleImages;
}

async function downloadIntoFolder(url) {
  const product = await getImageUrlsFromHTML(url)
  .then((res) => {
    console.log(res.title)
    const folderPath = path.dirname(modulePath) + '\\' + res.title;
    //========================CREATING DIRECTORY========================================
    fs.mkdir(folderPath, (err) => {
      console.log(err);
    })
    res.images.forEach((url,i) => {
      console.log(url)
      downloadImage(url,i,folderPath);
    })
    //==================================================================================

    console.log(folderPath)
    console.log(res.images)

  })

}


async function downloadImage(imageUrl, name, imageFolderPath) {
  fetch(imageUrl)
  .then((response) => {
    const fileStream = fs.createWriteStream(path.join(imageFolderPath, name + '.jpg'));
    console.log('udalo sie')
    console.log(imageFolderPath);
    //console.log(imageUrl)
    response.body.pipe(fileStream);
  })
  .catch((error) => {
    console.error(error);
  });

}


function validURL(url) {
  try {
    new URL(url);
    return true;
  } catch(e) {
    return false;
  }
}


//Pobiera zdjecia z aukcji których linki są w pliku oferty.txt
async function readUrlsFromFile() {

  const fileStream = fs.createReadStream(path.join(path.dirname(modulePath),'oferty.txt'));

  const rl = readline.createInterface({
    input: fileStream,
  });
  rl.on('line',(line) => {
    if(validURL(line)) {
      downloadIntoFolder(line);
  }
   else {
    console.log(`URL in the line is not valid: ${line}`)
  }});
  rl.on('close', () => {
    console.log('End');
  });
}


async function getSellerPageHTML(pageNumber) {
  let url = `**********${pageNumber}`;

  let options = {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/108.0',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      Referer: 'https://allegro.pl/',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
    }
};
  const response = await fetch(url,options);
  const htmlData = await response.text();
  return htmlData;
}

/*
  TO DZIALA TYLKO LEPIEJ NIE UZYWAC BO BANA DOSTANIESZ NA IP
async function getProductsFromSellerSite() {
  const productsUrls = [];
  
   
  {
    const htmlText = await getSellerPageHTML(1);
    const site = load(htmlText);
    let currentPage = site('div.munh_16:nth-child(1) > div:nth-child(1) > input:nth-child(1)').val();
    console.log(currentPage);
  }
  let i=2;
  while(true) {
    const htmlText = await getSellerPageHTML(i);
    const site = load(htmlText);
    let currentPage = site('div.munh_16:nth-child(1) > div:nth-child(2) > input:nth-child(1)').val();
    console.log(currentPage)
    if(currentPage === undefined)
      break;
    i++;
  }
  
  const htmlText = await getSellerPageHTML(1);
  const site = load(htmlText);
  let currentPage = site('div.munh_16:nth-child(1) > div:nth-child(1) > input:nth-child(1)').val();
  const products = site('._w7z6o._uj8z7.meqh_en.mpof_z0.mqu1_16.m6ax_n4._6a66d_LX75-');
  //console.log(htmlText)
  products.each((i,product) => {
    console.log(i)
    setTimeout(downloadIntoFolder,i*30000,product.attribs.href)
    //downloadIntoFolder(product.attribs.href)
    console.log(product.attribs.href);
  })
}
*/


/*pobiera zdjecia z jednej aukcji podanej w argumencie
downloadIntoFolder('https://allegro.pl/oferta/peterson-damski-maly-portfel-skora-naturalna-rfid-13156797098?bi_c=StrefaOkazji_Karuzela&bi_m=mpage&');
*/
downloadIntoFolder('https://allegro.pl/oferta/peterson-damski-maly-portfel-skora-naturalna-rfid-13156797098?bi_c=StrefaOkazji_Karuzela&bi_m=mpage&');