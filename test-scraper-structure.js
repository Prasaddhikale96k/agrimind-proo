const axios = require('axios');
const cheerio = require('cheerio');

async function testKisanDealsStructure() {
  const url = 'https://www.kisandeals.com/mandiprices/district/POTATO/ALL/MAHARASHTRA';
  console.log('=== KISANDEALS TABLE STRUCTURE ===');
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    });
    const $ = cheerio.load(data);
    
    $('table').each((tableIdx, table) => {
      console.log(`\n--- Table ${tableIdx + 1} ---`);
      const rows = $(table).find('tr');
      console.log(`Rows: ${rows.length}`);
      rows.each((rowIdx, row) => {
        const cells = $(row).find('td, th');
        const cellTexts = [];
        cells.each((cellIdx, cell) => {
          cellTexts.push($(cell).text().trim().substring(0, 50));
        });
        if (cellTexts.length > 0) {
          console.log(`  Row ${rowIdx}: [${cellTexts.join(' | ')}]`);
        }
      });
    });
  } catch (err) {
    console.log('Error:', err.message);
  }
}

async function testCommodityOnlineStructure() {
  const url = 'https://www.commodityonline.com/mandiprices/potato/maharashtra';
  console.log('\n=== COMMODITYONLINE TABLE STRUCTURE ===');
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });
    const $ = cheerio.load(data);
    
    $('table').each((tableIdx, table) => {
      console.log(`\n--- Table ${tableIdx + 1} ---`);
      const rows = $(table).find('tr');
      console.log(`Rows: ${rows.length}`);
      rows.each((rowIdx, row) => {
        const cells = $(row).find('td, th');
        const cellTexts = [];
        cells.each((cellIdx, cell) => {
          cellTexts.push($(cell).text().trim().substring(0, 50));
        });
        if (cellTexts.length > 0) {
          console.log(`  Row ${rowIdx}: [${cellTexts.join(' | ')}]`);
        }
      });
    });
  } catch (err) {
    console.log('Error:', err.message);
  }
}

async function main() {
  await testKisanDealsStructure();
  await testCommodityOnlineStructure();
}

main();
