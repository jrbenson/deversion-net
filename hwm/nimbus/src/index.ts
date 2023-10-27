import './index.css'
import './map.css'
import { StarChart } from './starchart'
import { SystemList } from './ui'
import { getData } from './data'

getData().then((data) => {
  const mapElem = document.querySelector('#map') as HTMLElement
  const starChart = new StarChart(mapElem, data)

  const listElem = document.querySelector('#list') as HTMLElement
  const list = new SystemList(listElem, data)

  list.on('select', (id: string) => {
    starChart.setSelected(id, false)
    // console.log('List told map to select', id)
  })

  starChart.on('select', (id: string) => {
    list.setSelected(id, false)
    // console.log('Map told list to select', id)
  })

  const btnList = document.querySelector('#btn-list') as HTMLElement
  btnList.addEventListener('click', () => {
    listElem.classList.toggle('hidden')
  })
})
