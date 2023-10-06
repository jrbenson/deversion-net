export interface Signal {
  name: string
  type: string
  scan: number
  level: number
}

export interface Asteroid {
  ore: string
  level: number
}

export interface Jovian {
  bands: string[]
}

export interface Planet {
  type: string
  moons: number
  color?: string
}

export interface System {
  name: string
  tier: number
  faction: string
  level: number
  station: boolean
  signals: Signal[]
  asteroids: Asteroid[]
  jovians: Jovian[]
  planets: Planet[]
}
