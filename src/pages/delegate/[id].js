import { Flex, Box, Grid, Image } from 'theme-ui'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'

const Delegate = () => {
  const [backIconHover, setBackIconHover] = useState(false);

  const router = useRouter();
  const redirectToTable = () => {
    router.push('/');
  }
  let backgroundColor = backIconHover ? 'rgba(80, 37, 200, 1)' : '';

  return (
    <Box sx={{
      pt: '48px',
      m: '0 auto',
      padding: '40px',
      textAlign: 'Left',
      height: '100vh',
      background: `url('/images/Background.jpg') no-repeat`,
      backgroundSize: '100% 100%'
    }}>
      <Flex>
        <Box sx={{
              borderRadius: '50%',
              padding: '12px',
              width: '42px',
              height: '42px',
              background: backgroundColor,
              textAlign: 'center',
              marginRight: '12px'
            }}
            onClick={redirectToTable}
            onMouseEnter={() => {setBackIconHover(true);}}
            onMouseLeave={() => {setBackIconHover(false);}}>    
          <Image sx={{
              transform: 'rotate(-90deg)',
            }} 
            src="/images/Direction-Up.svg" >
          </Image>
        </Box>
        <Box sx={{
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              background: 'white',
              textAlign: 'center',
              marginRight: '16px'
            }}
          />
        <Box>
          <Flex>
            <Image sx={{
                  marginRight: '12px'
                }} 
                src="/images/Delegate.svg" >
            </Image>
            <Box> Delegate </Box>
          </Flex>
          <Box sx={{
            fontSize: '32px',
            fontWeight: 'blod'
          }}> {router.query.id} </Box>
        </Box>
      </Flex>
    </Box>
  );
}

export default Delegate;