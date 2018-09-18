const puppeteer = require('puppeteer')
const BASE_URL = 'https://pcpartpicker.com'
const fs = require("fs")
async function main(){
  try {
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage()
    page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36')
    await page.goto(`${BASE_URL}/products/cpu/`, {waitUntil: 'networkidle2'})
    await page.setViewport({width:1920, height:1080})
    let detailsUrl = await page.evaluate(()=>{
      const urls = document.querySelectorAll(".tdname a")
      return Array.from(urls).map(a=>'https://pcpartpicker.com'+a.getAttribute("href"))
    })
    // console.log(detailsUrl)
    let cpuDetails = []
    let i = 0
    for(const detailUrl of detailsUrl){
      await page.goto(detailUrl)
      await page.waitFor(200)
      const cpuDetail = await page.evaluate(()=>{
        let detail = document.querySelector('.specs.block').innerText.split('\n')        
        let MANUFACTURER = `${detail[2]}`.toString()
        let PARTNUM = `${detail[4]}`.toString()
        let DATAWIDTH = `${detail[6]}`.toString()
        let SOCKET = `${detail[8]}`.toString()
        let OPERATING_FREQUENCY = `${detail[10]}`.toString()
        let MAX_TURBO = `${detail[12]}`.toString()
        let CORES = `${detail[14]}`.toString()
        let L1_CACHE = `${detail[16]} ${detail[17]}`.toString()
        let L2_CACHE = `${detail[19]}`.toString()
        let L3_CACHE = `${detail[21]}`.toString()
        let LITHOGRAPHY = `${detail[23]}`.toString()
        let THERMAL_DESIGN_POWER = `${detail[25]}`.toString()
        let INCLUDES_CPU_COOLER = `${detail[27]}`.toString()
        let MULTI_THREADING = `${detail[29]}`.toString()
        let MAX_MEM = `${detail[31]}`.toString()
        let INT_GRAPHICS = `${detail[33]}`.toString()
        return {
          MANUFACTURER,PARTNUM,DATAWIDTH,SOCKET,OPERATING_FREQUENCY,MAX_TURBO,CORES,
          L1_CACHE,L2_CACHE,L3_CACHE,LITHOGRAPHY,THERMAL_DESIGN_POWER,INCLUDES_CPU_COOLER,
          MULTI_THREADING,MAX_MEM,INT_GRAPHICS          
        }
        // return detail
      })
      cpuDetails.push(cpuDetail)
      console.log(cpuDetail)
      let saveCpu = cpuDetails.map(e=>{
        return `
        INSERT INTO TABLE (
        MANUFACTURER,
        PARTNUM,
        DATAWIDTH,
        SOCKET,
        OPERATING_FREQUENCY,
        MAX_TURBO,
        CORES,
        L1_CACHE,
        L2_CACHE,
        L3_CACHE,
        LITHOGRAPHY,
        THERMAL_DESIGN_POWER,
        INCLUDES_CPU_COOLER,
        MULTI_THREADING,
        MAX_MEM,
        INT_GRAPHICS
        )VALUES(
          '${e.MANUFACTURER}',
          '${e.PARTNUM}',
          '${e.DATAWIDTH}',
          '${e.SOCKET}',
          '${e.OPERATING_FREQUENCY}',
          '${e.MAX_TURBO}',
          '${e.CORES}',
          '${e.L1_CACHE}',
          '${e.L2_CACHE}',
          '${e.L3_CACHE}',
          '${e.LITHOGRAPHY}',
          '${e.THERMAL_DESIGN_POWER}',
          '${e.INCLUDES_CPU_COOLER}',
          '${e.MULTI_THREADING}',
          '${e.MAX_MEM}',
          '${e.INT_GRAPHICS}'
        );
        `
      })
      fs.writeFile('cpu.sql', saveCpu, err=>{
        if(err) throw err
      })
      console.log(cpuDetails)
    }
    browser.close()
    return cpuDetails
  } catch (error) {
    console.log(`Our Error: ${error}`);
  }
}
main()
// (async ()=>{
//   let table = await main()
//   let sqlInsert = table
//     .map(td=>{
//       const {MANUFACTURER, PARTNUM,DATAWIDTH,SOCKET,OPERATING_FREQUENCY,MAX_TURBO,CORES,L1_CACHE,L2_CACHE,L3_CACHE,LITHOGRAPHYm,THERMAL_DESIGN_POWER,INCLUDES_CPU_COOLER,MULTI_THREADING,MAX_MEM,INT_GRAPHICS} = td
//       return `INSERT INTO cpu(MANUFACTURER, PARTNUM,DATAWIDTH,SOCKET,OPERATING_FREQUENCY,MAX_TURBO,CORES,L1_CACHE,L2_CACHE,L3_CACHE,LITHOGRAPHYm,THERMAL_DESIGN_POWER,INCLUDES_CPU_COOLER,MULTI_THREADING,MAX_MEM,INT_GRAPHICS)
//               VALUES ('${MANUFACTURER}', '${PARTNUM}','${DATAWIDTH}','${SOCKET}','${OPERATING_FREQUENCY}','${MAX_TURBO}','${CORES}','${L1_CACHE}','${L2_CACHE}','${L3_CACHE}','${LITHOGRAPHY}','${THERMAL_DESIGN_POWER}','${INCLUDES_CPU_COOLER}','${MULTI_THREADING}','${MAX_MEM}','${INT_GRAPHICS}')`
//     })
//     fs.writeFile(__dirname, 'cpu.sql', sqlInsert, err =>{
//       if( error ) throw err
//     })
// })()
