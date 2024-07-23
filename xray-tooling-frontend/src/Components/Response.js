import React, {useEffect} from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import './ResponseAnimation.css'


const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));


function Response({ responseData, responseDocs, status }) {

    console.log(status)

  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  //const cardClass = status === 'open' ? 'card throbbing-border' : '';




  return (
    <div class="flex justify-between text-left mt-5 mb-14 bg-response-grey w-full h-auto rounded-3xl">
      <Card sx={{ width: '100%' }}>
        <CardContent>
          <Typography fontSize='18px'>
            {responseData}
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'end' }}>
            <Typography fontSize='16px' fontWeight="bold">Why you should believe us</Typography>
            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </Box>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent >
            {responseDocs.map((doc, index) => {
              return (
                <div style={{ display: 'block', marginBottom: '20px' }}>
                  <Typography key={index} variant='10px' fontWeight="bold" sx={{ marginBottom: '5px', display: 'block' }}>
                    Source Document: {index}
                  </Typography>
                  <Typography key={index} variant='12px' fontWeight="light" color="black" >
                    {doc}
                  </Typography>
                </div>
              )
            })}
          </CardContent>
        </Collapse>
      </Card>
    </div>
  );
}

export default Response;
