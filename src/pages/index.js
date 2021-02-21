import { Box, Grid, Button, Flex, Input, Image } from 'theme-ui'
import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { withApollo } from '../apollo/client'
import { EPOCHES_QUERY } from '../apollo/queries'
import { jsx } from 'theme-ui'
import { useRouter } from 'next/router'
import { IconButton } from 'theme-ui'

const TEXT_COLOR = 'rgba(255,255,255, 0.5)';
const SELECTED_TEXT_COLOR = 'rgba(255,255,255, 0.9)';
const HOVER_TEXT_COLOR = 'rgba(255,255,255, 0.6)';

const EpochRow = ({id, list}) => {
  const [onHover, setOnHover] = useState(false);
  const [onIconHover, setOnIconHover] = useState(false);

  const router = useRouter();

  const redirectToDelegate = (id) => {
    router.push({
      pathname: '/delegate/[id]',
      query: {id}
    });
  }

  const onHoverColor = onHover ? 'rgba(255,255,255,0.1)' : '';
  const onIconHoverColor = onIconHover ? 'rgba(80, 37, 200, 1)' : 'rgba(255, 255, 255, 0.05)'
  return (
    <Grid 
      sx={{
        textAlign: 'left',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '8px 0px 8px',
        boxSizing: 'border-box',
        background: onHoverColor,
        alignItems: 'center'
      }}
      gap={0}
      columns={[2, '6fr 1fr']} 
      onMouseEnter={() => { setOnHover(true); }}
      onMouseLeave={() => { setOnHover(false); }}>
      <Grid
        columns={5} 
        gap={0}>
        {list} 
      </Grid>
      {onHover && 
      <Box sx={{
          textAlign: 'left',
        }}
        onClick={() => { redirectToDelegate(id); }}>
        <Flex>
          <Box sx={{
            borderRadius: '50%',
            padding: '8px',
            background: onIconHoverColor
          }}
          onMouseEnter={() => { setOnIconHover(true); }}
          onMouseLeave={() => { setOnIconHover(false); }}>
            <Image src="/images/Delegate.svg" />
          </Box>
        </Flex>
      </Box>
      }
    </Grid>
  );
}

const TableHeader = ({field, name, sortColumn, selected}) => {
  const [hover, setHoverColumn] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');

  const handleOnClick = (field) => {
    if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder('asc');
    }
    sortColumn(field, sortOrder);
  }

  let borderBottomColor = '';
  let textColor = TEXT_COLOR;
  let showIcon = false;

  if (hover) {
    borderBottomColor = `1px solid ${HOVER_TEXT_COLOR}`;
    textColor = HOVER_TEXT_COLOR;
    showIcon = true;
  }
  if (selected) {
    borderBottomColor = `1px solid ${SELECTED_TEXT_COLOR}`;
    textColor = SELECTED_TEXT_COLOR;
    showIcon = true;
  }

  const orderIcon = sortOrder === 'asc' ? "/images/Direction-Down.svg" : "/images/Direction-Up.svg"
  return (
    <Flex sx={{
      alignItems: 'center'
    }}>
      <Box sx={{
          textAlign: 'left',
          paddingBottom: '12px',
          color: textColor,
          fontSize: '12px',
          borderBottom: borderBottomColor,
          width: '100%'
        }}
        key={name} bg='primary' 
        onClick={() => { handleOnClick(field); }}
        onMouseEnter={() => { setHoverColumn(true); showIcon = false;}}
        onMouseLeave={() => { setHoverColumn(false); showIcon = false;}}
      > 
        { name.toUpperCase() } 
        {
          (showIcon) &&
          <Image sx={{
              marginLeft: '8px'
            }}
            src={orderIcon} />
        }
      </Box>
    </Flex> 
  )
}

const EpochTableHeaders = ({sortColumn, columnsDef}) => {
  const [selectedColumn, setSelectedColumn] = useState('startBlock');

  const handleOnClick = (field) => {
    setSelectedColumn(field);
  }

  const tableHeader = columnsDef.map(( { name, field }) => {
    let selected = selectedColumn === field ? true : false;
    return name !== '__typename' ? 
      <Box key={field} onClick={() => { handleOnClick(field); }}>
        <TableHeader selected={selected} name={name} field={field} sortColumn={sortColumn} /> 
      </Box> : '';
  });

  return (
    <Grid
      sx={{
        borderBottom: '1px solid rgba(255,255,255, 0.2)',
      }} 
      gap={0}
      columns={[2, '6fr 1fr']}
    >
      <Grid gap={0} columns={5}>
        {tableHeader}
      </Grid>
      <Box></Box>
    </Grid>
  );
}

const EpochesTable = ({max, searchBlock}) => {
  const LOAD_MORE_MAX = 3;
  const [skip, setSkip] = useState(0);
  const [first, setFirst] = useState(LOAD_MORE_MAX);
  const [epochesList, setEpochesList] = useState([]);
  const [orderBy, setOrderBy] = useState('startBlock');
  const [orderDirection, setOrderDirection] = useState('asc');

  let variables = {
    skip,
    first,
    orderBy,
    orderDirection
  }

  if(searchBlock) {
    variables.where = {
      startBlock: parseInt(searchBlock)
    }
  }

  const {loading, error, data} = useQuery(EPOCHES_QUERY, {
    variables,
  });

  // console.log(error);

  if (error) return `Error! ${error.message}`; 
  
  useEffect(() => {
    if(data) {
      setEpochesList(data.epoches);
    }
  }, [data]);

  const columns = [
    { 
      name: 'id',
      field: 'id',
    }, 
    {
      name: 'start block',
      field: 'startBlock'
    },
    {
      name: 'end block',
      field: 'endBlock'
    },
    {
      name: 'query fee',
      field: 'queryFeeRebates',
      unit: 'GRT'
    }
    , 
    {
      name: 'total rewards',
      field: 'totalRewards',
      unit: 'GRT'
    }
  ];

  const setOrderForColumn = (colName, sortOrder) => {
    let skip = 0;
    if (sortOrder === 'desc') {
      skip = max - first;
    } else {
      skip = 0;
    }
    setOrderDirection(sortOrder);
    setSkip(skip);
    setOrderBy(colName);
  }

  const tableContent = epochesList.map((epoch) => {
    let list = [];
    for(const [key, value] of Object.entries(epoch)) {
      if (key !== '__typename') {
        if (key === 'queryFeeRebates' || key === 'totalRewards') {
          value = parseInt(value) / 10^18;
          if (value < 0) value = 0;
        }
        const col = columns.find((col) => col.field === key);
        let textColor = TEXT_COLOR;
        if (col.field === orderBy) {
          textColor = SELECTED_TEXT_COLOR;
        }
        list.push(
          <Flex sx={{
              lineHeight: '48px',
              color: textColor,
              alignItems: 'center'
            }}
            key={`${epoch.id}-${key}`}
          >
            <Box sx={{ margin: '4px' }}key={`${epoch.id}-${key}`} bg='primary'> {value} </Box>
            <Box sx={{ fontSize: '12px' }}> {col.unit} </Box>
          </Flex>
        );
      }
    }
    let onHover = true;
    return (
      <EpochRow key={epoch.id} id={epoch.id} list={list}> </EpochRow>
    );
  });

  const loadMore = () => {
    const newFirst = first < max ? first + LOAD_MORE_MAX : LOAD_MORE_MAX;
    setFirst(newFirst);
    if (orderDirection === 'desc') {
      setSkip(max - newFirst);
    }
  };

	return (
    <Box>
      <EpochTableHeaders columnsDef={columns} sortColumn={setOrderForColumn}/>
      <Box sx={{
        marginBottom: '24px',
      }}>
        {tableContent}
      </Box>
      <Box sx={{
        textAlign: 'left',
        marginBottom: '24px',
        fontSize: '12px',
        color: TEXT_COLOR
      }}>
        {epochesList.length} of {max}
      </Box>
      <Box>
        <Button sx={{
          background: 'none',
          border: 'solid 1px rgba(255, 255, 255, 0.5)',
          padding: '14px 28px 14px',
          fontWeight: 'bold'
        }} 
        onClick={loadMore}> Load More </Button>
      </Box>
    </Box> 
	)
}

const SearchBar = ({setSearch}) => {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  let textColor = hover ? HOVER_TEXT_COLOR : TEXT_COLOR;

  return (
    <Flex sx={{
      alignItems: 'center'
    }}>
      <Box sx={{
        fontSize: '30px',
        fontWeight: 'bold',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        paddingRight: '20px',
        marginRight: '20px'
      }}>
        Indexers 
      </Box>
      { !active &&
        <Flex 
          sx={{
            color: textColor,
            cursor: 'pointer'
          }}
          onMouseEnter={() => { setHover(true); }}
          onMouseLeave={() => { setHover(false); }}
          onClick={() => { setActive(true); }}>
          <Image sx={{ marginRight: '8px' }} src="/images/Search.svg" />
          <Box> Search </Box>
        </Flex>
      }
      { active &&
        <Flex sx={{ alignItems: 'center', width: '800px'}}>
          <Box sx={{
              color: textColor,
              cursor: 'pointer'
            }}
            onClick={() => { setActive(false); setSearch(''); }}> x </Box>
          <Input 
            sx={{
              marginLeft: '8px',
              border: 'none',
              width: '15%',
              color: 'rgba(255, 255, 255, 0.5)',
              outline: 'none'
            }}
            placeholder="1"
            onChange={e => setSearch(e.target.value)} type="number"/> 
        </Flex>
      }
    </Flex>
  )
}

const Index = () => {
  const [searchBlock, setSearchBlock] = useState('');
  const { loading, error, data } = useQuery(EPOCHES_QUERY, {
    variables: {
      orderBy: 'startBlock'
    }
  });

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`; 
  
  const { epoches } = data;
  const maxEpoches = epoches.length;

  const setSearch = (searchStr) => {
    setSearchBlock(searchStr);
  }

	return (
		<Box sx={{
      pt: '48px',
      m: '0 auto',
      p: '60px',
      textAlign: 'center',
      height: '100vh',
      background: `url('/images/Background.jpg') no-repeat`,
      backgroundSize: '100% 100%'
    }}>
      <Box sx={{
        textAlign: 'left',
        marginBottom: '40px',
      }}>
        <SearchBar setSearch={setSearch}></SearchBar>
      </Box>
      <EpochesTable max={maxEpoches} searchBlock={searchBlock}> </EpochesTable>
		</Box>
	)
}

export default withApollo(Index, { ssr: false })

