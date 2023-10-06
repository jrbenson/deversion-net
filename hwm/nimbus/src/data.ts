import { parse } from 'papaparse'
import { Asteroid, Jovian, Planet, Signal, System } from './system'

// URL for retrieving the CSV data from Google Sheets
const DATA_URL =
  'https://docs.google.com/spreadsheets/d/1eTCM4KNb7lv7mtFmMx9WVOud2pg7EnqcDP40n9S-5go/gviz/tq?tqx=out:csv&sheet=Systems%201.7'

// Index of the columns in the CSV data for adjustable lookup
const COL_TIER_HEADER = 1
const COL_FACTION = 1
const COL_SYSTEM = 2
const COL_LEVEL = 3
const COL_STATION = 4
const COL_SIGNAL_TOTAL = 5
const COL_SIGNALS = {
  'Cangacian Signal': [6, 7, 8],
  'Tanoch Signal': [9, 10, 11],
  'Yaot Signal': [12, 13, 14],
  'Amassari Signal': [15, 16, 17],
  'Kiithless Signal': [18, 19, 20],
  'Relic Recovery': [21, 22, 23],
  'Progenitor Signal': [24, 25, 26],
  'Progenitor Activities': [27, 28, 29],
  'Distress Call': [30, 31, 32],
  'Traveling Trader': [33, 34, 35],
  Other: [36, 37, 38],
}
const COL_ASTEROIDS = [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52]
const COL_JOVIANS = [
  [57, 58, 59],
  [60, 61, 62],
  [63, 64, 65],
  [66, 67, 68],
]
const COL_PLANETS = [71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84]
const ROW_START = 4

const GREEK_LETTERS = [
  'Alpha',
  'Beta',
  'Gamma',
  'Delta',
  'Epsilon',
  'Zeta',
  'Eta',
  'Theta',
  'Iota',
  'Kappa',
  'Lambda',
  'Mu',
  'Nu',
  'Xi',
  'Omicron',
  'Pi',
  'Rho',
  'Sigma',
  'Tau',
  'Upsilon',
  'Phi',
  'Chi',
  'Psi',
  'Omega',
]

export async function getData() {
  const response = await window.fetch(DATA_URL)
  const data = (await response.text().then((text) => parse(text).data)) as string[][]
  return parseData(data)
}

function parseData(data: string[][]) {
  data = data.slice(ROW_START)

  const systems: Map<string, System> = new Map()

  let currentTier = 0
  for (let row of data) {
    if (row[COL_SYSTEM] === '') {
      if (row[COL_TIER_HEADER] !== '') {
        const tierString = String(row[COL_TIER_HEADER])
        const tier = Number(tierString.split(' ')[1])
        currentTier = tier
      }
    } else {
      const system: System = {
        tier: currentTier,
        faction: row[COL_FACTION],
        name: String(row[COL_SYSTEM]).split('[')[0].trim(),
        level: Number(row[COL_LEVEL]),
        station: String(row[COL_STATION]).toLowerCase().includes('y'),
        signals: [],
        asteroids: [],
        jovians: [],
        planets: [],
      }
      for (let [type, scans] of Object.entries(COL_SIGNALS)) {
        for (let scanIndex = 0; scanIndex < scans.length; scanIndex++) {
          const count = Number(row[scans[scanIndex]])
          for (let sigIndex = 0; sigIndex < count; sigIndex++) {
            let name = `${type}`
            if (count > 1) {
              name += ` ${GREEK_LETTERS[sigIndex]}`
            }
            const signal: Signal = {
              name: name,
              type: type,
              scan: scanIndex + 1,
              level: system.level,
            }
            system.signals.push(signal)
          }
        }
      }
      for (let asteroidIndex of COL_ASTEROIDS) {
        if (row[asteroidIndex] !== '') {
          let asteroidStrings = String(row[asteroidIndex]).split(',')
          for (let asteroidString of asteroidStrings) {
            let ore = asteroidString.substring(0, 1)
            let level = Number(asteroidString.substring(1))
            let asteroid: Asteroid = {
              ore: ore,
              level: level,
            }
            system.asteroids.push(asteroid)
          }
        }
        systems.set(system.name, system)
      }
      for (let bandIndices of COL_JOVIANS) {
        if (row[bandIndices[0]] !== '') {
          let bands = []
          for (let bandIndex of bandIndices) {
            bands.push(String(row[bandIndex]))
          }
          let jovian: Jovian = {
            bands: bands,
          }
          system.jovians.push(jovian)
        }
      }
      for (let planetCol of COL_PLANETS) {
        if (row[planetCol] !== '') {
          let planetString = String(row[planetCol])
          let moons = 0
          if (planetString.includes("'")) {
            let moonString = planetString.substring(planetString.indexOf("'"))
            moons = moonString.length
            planetString = planetString.substring(0, planetString.indexOf("'"))
          }
          let planet: Planet = {
            type: planetString,
            moons: moons,
          }
          system.planets.push(planet)
        }
      }
    }
  }

  return systems
}
