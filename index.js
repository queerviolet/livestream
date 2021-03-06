#!/usr/bin/env node

const Nightmare = require('nightmare')
    , seconds = 1000
    , waitTimeout = 60 * seconds
    , input = (name, tag='input') => `${tag}[name="${name}"]`
    , titleInput = input('title')    
    , descriptionTextarea = input('description', 'textarea')    

/**
 * async livestream({
 *   title?: String,
 *   description?: String,
 *   interactive?: Bool,
 *   partition?: String
 * }) ~> url: String
 * 
 * Set the title and description of your default Youtube live stream,
 * then resolve with the view URL for the stream.
 * 
 * If you haven't logged in before, you must use show=true to see the
 * login screen.
 */
const livestream = module.exports = async function livestream({title, description, interactive: show=true, partition='persist: livestream'}) {
  const dashboard = Nightmare({
      webPreferences: {partition},
      typeInterval: 5,
      waitTimeout,
      show
    })
    .goto('https://www.youtube.com/live_dashboard')
    .wait(titleInput)
    .wait(descriptionTextarea)
  
  title && await
    dashboard
      .insert(titleInput, '')
      .insert(titleInput, Math.random())
      .insert(titleInput, '')      
      .insert(titleInput, title)
  
  description && await
    dashboard
      .insert(descriptionTextarea, '')
      .insert(descriptionTextarea, Math.random())
      .insert(descriptionTextarea, '')      
      .insert(descriptionTextarea, description)

  await dashboard.wait(saved)
  
  return dashboard.evaluate(getStreamUrl).end()
}

function main(argv=process.argv) {
  livestream(
    require('commander')  
      .version(require('./package').version)
      .option('-t, --title [title]', 'Stream title')
      .option('-d, --description [description]', 'Stream description')
      .option('-i, --interactive', 'Show the browser window', true)
      .parse(argv))
    .then(url => {
      console.log(url)
      process.exit(0)
    })
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}

function saved() {
  const msg = document.querySelector('.main-message')
  return msg && msg.textContent === 'All changes saved.'
}

function getStreamUrl() {
  const input = document.querySelector('input[value^="https://www.youtube.com"]')
  return input && input.value
}

function keystrokes(str) {
  return str.replace(/\n/g, '\u000d')
}

if (module === require.main)
  main()