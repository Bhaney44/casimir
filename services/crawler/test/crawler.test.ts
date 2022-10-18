import { crawler } from '../src/index'
import { Chain } from '../src/index'

jest.setTimeout(1000000)

test('init crawler for ethereum', async () => {
  const eth = await crawler({
    chain: Chain.Ethereum,
    options: {
      url: 'https://eth-mainnet.g.alchemy.com/v2/RxFGV7vLIDJ--_DWPRWIyiyukklef6pf'
    },
    verbose: true,
    stream: false
  })
  // await eth.start()
  expect(eth).not.toBe(null)
})

// test('init crawler for iotex', async () => {
//   const iotex = await crawler({
//     chain: Chain.Iotex,
//     verbose: true
//   })
//   await iotex.start()
//   expect(iotex.service).not.toBe(null)
// })

// test('query athena thru service', async () => {
//   const supercrawler = await crawler({
//     chain: Chain.Ethereum,
//     verbose: true,
//   })
//
//   const lastBlock = await supercrawler.getLastProcessedEvent()
//
//   if (!lastBlock) {
//     throw new Error('last block not found')
//   }
//   expect(lastBlock.chain).toBe('ethereum')
//   expect(lastBlock.height).not.toBe(null)
// })
