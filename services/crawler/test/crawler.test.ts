import { crawler } from '../src/index'
import { Chain } from '../src/providers/Base'

jest.setTimeout(1000000)

test('init crawler for iotex', async () => {
  const iotex = await crawler({
    chain: Chain.Iotex,
    verbose: true
  })
  expect(iotex.service).not.toBe(null)
})

test('init crawler for ethereum', async () => {
  const eth = await crawler({
    chain: Chain.Ethereum,
    verbose: true
  })
  expect(eth.service).not.toBe(null)
})


test('get last processed event', async () => {
  const supercrawler = await crawler({
    chain: Chain.Ethereum,
    verbose: true
  })

  const lastBlock = await supercrawler.getLastProcessedEvent()

  if (!lastBlock) {
    throw new Error('last block not found')
  }
  expect(lastBlock.chain).toBe('ethereum')
  expect(lastBlock.height).not.toBe(null)
})

// test('start crawler for ethereum', async () => {
//   const eth = await crawler({
//     chain: Chain.Ethereum,
//     verbose: true
//   })
//   await eth.start()
//   expect(eth.service).not.toBe(null)
// })

// test('start crawler for iotex', async () => {
//   const iotex = await crawler({
//     chain: Chain.Iotex,
//     verbose: true
//   })
//   await iotex.start()
//   expect(iotex.service).not.toBe(null)
// })