const axios = require('axios')
const cheerio = require('cheerio')    // web-scraper library ... https://github.com/cheeriojs/cheerio#readme
const jsonfile = require('jsonfile')
const path = require('path')
const moment = require('moment')

// pages to parse
const baseurl = 'https://www.brainyquote.com'
const params = [
  // {
  //   resource: '/authors/abraham-lincoln-quotes',
  //   filename: path.join(__dirname, './datasets/abraham-lincoln.json')
  // },
  // {
  //   resource: '/topics/abraham-lincoln-quotes',
  //   filename: path.join(__dirname, './datasets/about-lincoln.json')
  // },
  // {
  //   resource: '/authors/plutarch-quotes',
  //   filename: path.join(__dirname, './datasets/plutarch.json')
  // },
  // {
  //   resource: '/authors/plutarch-quotes',
  //   filename: path.join(__dirname, './datasets/plutarch.json')
  // },
  // {
  //   resource: '/authors/sun-tzu-quotes',
  //   filename: path.join(__dirname, './datasets/sun-tzu.json')
  // },
  {
    resource: '/authors/ulysses-s-grant-quotes',
    filename: path.join(__dirname, './datasets/ulysses-grant.json')
  },
]

// write to file
// const filename = path.join(__dirname, './datasets/brainyquotes.json')
// const minifiedfilename = path.join(__dirname, './datasets/brainyquotes.min.json')

// GO !
scrape()

async function scrape() {
  console.clear()
  let extracted = []
  
  for await (const param of params) {
    try {
      const quotes = await extractQuotes(param)
      extracted = extracted.concat(quotes)
    } catch (error) {
      console.error(error)
      continue;
    }
    const minfilename = param.filename.replace('.json', '.min.json')
    
    await jsonfile.writeFile(param.filename, extracted, { spaces: 2 })
      .then(() => console.log(`Success! Wrote ${extracted.length} quotes to ${param.filename}.`))
    await jsonfile.writeFile(minfilename, extracted)
      .then(() => console.log(`Success! Wrote ${extracted.length} quotes to ${minfilename}.`))

  }  
}

async function extractQuotes({ resource }) {
  try {
    const response = await axios.get(`${baseurl}${resource}`)
    const today = moment().format('D MMMM YYYY')

    // load the html into the parser library
    const $ = cheerio.load(response.data)
    const textAnchors = $('a.b-qt')

    let quotes = []
    for (let i = 0; i < textAnchors.length; i++) {
      const textAnchor = textAnchors[i]
      const text = textAnchor.children[0].data
      const href = /[^\?]*/.exec(textAnchor.attribs.href)[0]
      const id = /\d{1,8}/.exec(href)[0]

      const authorAnchors = $(`a.bq-aut.qa_${id ?? ''}`)
      const author = authorAnchors[0].children[0].data
      
      const quote = {
        text,
        author,
        citation: `"${author} Quotes." BrainyQuote.com. BrainyMedia Inc, 2021. ${today}. ${baseurl}${href}`,
        source: `${baseurl}${href}`,
        tags: [],
        likes: 0,
        dislikes: 0
      }
      quotes.push(quote)
    }
    console.log(quotes[0])
    return quotes
  } catch (error) {
    throw error
  }
}
