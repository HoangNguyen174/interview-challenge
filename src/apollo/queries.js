import { gql } from 'apollo-boost'

export const EPOCHES_QUERY = gql`
	query Epoches($first: Int, $skip: Int, $orderBy: String, $orderDirection: OrderDirection, $where: Epoch_filter) {
		epoches(first: $first, skip: $skip, orderBy: $orderBy, where: $where, orderDirection: $orderDirection) {
			id
			startBlock
			endBlock
      queryFeeRebates
      totalRewards
		}
	}
`
