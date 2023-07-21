import { Grid, IconButton } from '@mui/material'
import React from 'react'
import {PsychologyAltOutlined} from '@mui/icons-material'
import Link from 'next/link'
export default function Index() {
  return (
    <Grid
    container
    justifyContent="center"
    alignItems="center"
    sx={{ height: "100vh" }}
  >
    <Grid item>
            <IconButton color="info" sx={{border:'2px solid'}} component={Link} href="/sticker" >
                <PsychologyAltOutlined sx={{fontSize:'10rem'}} />
            </IconButton>
        </Grid>
        </Grid>
  )
}
