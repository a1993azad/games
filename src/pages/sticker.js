import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import io from "socket.io-client";
import {
  Paper,
  IconButton,
  InputBase,
  List,
  ListItem,
  Button,
  ListItemText,
  Card,
  CardContent,
  Grid,
  Snackbar,
  TextField,
  CircularProgress,
  Typography,
  Dialog,
  ButtonGroup,
  Box,
} from "@mui/material";
import { AddCircleOutlined, DeleteOutlineOutlined } from "@mui/icons-material";
import { Modal } from "@mui/base";
import useInterval from "@/utils/useInterval";
let socket;

const Sticker = () => {
  const [name, setName] = useState("");
  const [input, setInput] = useState("");
  const [words, setWords] = useState([]);
  const [myWords, setMyWords] = useState([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openWordDialog, setOpenWordDialog] = useState(false);
  const [passed, setPassed] = useState({});
  const [currentWord, setCurrentWord] = useState('');
  const [counter, setCounter] = useState(0);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  useEffect(() => {
    socketInitializer();
  }, [1]);

  const socketInitializer = async () => {
    try {
      await fetch("/api/socket");
      socket = io(undefined, {
        path: "/api/socket_io",
      });

      socket.on("connect", () => {
        console.log("connected");
      });

      // socket.on("update-input", (msg) => {
      //   console.log(msg);
      //   //setInput(msg);
      // });
    } catch (error) {
      console.error(error);
    }
  };
  const getWords = () => {
    console.log(name);
    setLoading(true);
    socket.emit("getMyWords", name);
    setTimeout(()=>{
      if(loading)
        getWords()
    },3000)
  };
  const addNewItem = () => {
    //socket.emit("addWord", input);
    setInput("");
    setWords([...words, input]);
  };
  const onChangeHandler = (e) => {
    setInput(e.target.value);
  };
  const onChangeName = (e) => {
    setName(e.target.value);
  };
  const deleteItem = (item) => {
    const response = confirm("Are you sure you want to do that?");
    if (response) {
      setWords([...words.filter((w) => w !== item)]);
      // socket.emit("deleteWord", item);
    }
  };

  const submit = () => {
    if (!name) {
      return alert("Name is required!");
    }
    if (words.length !== 5) {
      return alert("Enter 5 words");
    }
    setLoading(true);
    socket.emit("submit", { words, name });
    setOpen(true);
    setReady(true);
    setTimeout(() => {
      socket.on("myWords_" + name, (msg) => {
        console.log(msg);
        setMyWords(msg);
        setLoading(false);
        //setInput(msg);
      });
      setLoading(false);
    }, 3000);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const showWord=(w)=>{
    setPassed({...passed,[w]:1})
    setCounter(10)
    setCurrentWord(w)
    
  }
  const answer=(flag)=>{
    if(flag && progress){
      setPassed({...passed,[currentWord]:progress})
    }
    setOpenWordDialog(false)
  }
  const getPoint=React.useCallback(()=>{
    let total=0
    if(passed){
      for (const key in passed) {
       total+= passed[key]-1
      }
    }
    return total
  },[passed])
  useInterval(()=>{
    if(counter>1){
      setCounter(counter-1)
    }else{
      setCounter(0)
      setProgress(100)
      setOpenWordDialog(true)
    }
  },counter>0?1000:null)
  useInterval(()=>{
    if(progress>0){
      setProgress(progress-1)
    }else{
      setProgress(0)
    }
  },!openWordDialog?null:1000)
  return (
    <>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ height: "100vh" }}
      >
        <Grid item>
          <Card>
            <CardContent>
              {loading ? (
                <>
                  <CircularProgress size={80} />
                </>
              ) : (
                <>
                  {ready ? (
                    <>
                      {myWords.length ? (
                        <>
                        <Grid container justifyContent="center">
                        <Grid items xs={12}>
                          <Typography variant="h6" color="darkblue" my={2} textAlign="center">

                          {name}
                          </Typography>
                        </Grid>
                        {myWords.map((w,i)=><Grid items key={i} >
<Button variant="outlined" color={passed[w]?'success':'secondary'} disabled={passed[w]} size="large" onClick={()=>showWord(w)} sx={{m:2}}>
{i+1}
</Button>
                        </Grid>)}
                        <Grid items xs={12}>
                          <Typography variant="h3" color="skyblue" my={5} textAlign="center">

                          {getPoint()}
                          </Typography>
                        </Grid>
                        </Grid>
                        </>
                      ) : (
                        <Button
                          variant="contained"
                          color="success"
                          sx={{
                            width: 200,
                            height: 200,
                            borderRadius: "50%",
                            lineHeight: 200,
                            fontSize: "3rem",
                          }}
                          onClick={getWords}
                        >
                          Start
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <TextField
                        variant="standard"
                        color="info"
                        label="Name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={onChangeName}
                        sx={{ mb: 5 }}
                      />
                      {name && (
                        <CustomizedInputBase
                          hideAddButton={words.length === 5}
                          value={input}
                          onChange={onChangeHandler}
                          addNewItem={addNewItem}
                        />
                      )}
                      <List>
                        {words.map((w, i) => (
                          <ListItem
                            key={i}
                            secondaryAction={
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                color="error"
                                onClick={() => deleteItem(w)}
                              >
                                <DeleteOutlineOutlined />
                              </IconButton>
                            }
                          >
                            <ListItemText primary={w} />
                          </ListItem>
                        ))}
                      </List>
                      <Button
                        variant="contained"
                        color="success"
                        sx={{ mx: "auto", display: "block" }}
                        onClick={submit}
                      >
                        Submit
                      </Button>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message="Submitted"
      />
      <Dialog
        open={!!counter}
        fullScreen
        
      >
        <Typography variant="h1" color={counter > 10?"greenyellow":"red"} sx={{m:'auto',display:'block'}}>{counter}</Typography>
        </Dialog>
  
      <Dialog
        open={openWordDialog}
        fullScreen
        
      >
        <Typography variant="h1" color={counter > 10?"greenyellow":"red"} sx={{m:'auto',display:'block',mb:5}}>{currentWord}</Typography>
        <CircularProgressWithLabel value={progress} />
        <ButtonGroup
        disableElevation
        variant="contained"
        aria-label="Disabled elevation buttons"
        sx={{m:'auto',display:'block',mt:5}}
      >
        <Button color="error" onClick={()=>answer(false)} size="large">False</Button>
        <Button color="success" onClick={()=>answer(true)} size="large">True</Button>
      </ButtonGroup>
        </Dialog>
    </>
  );
};

export function CustomizedInputBase({
  value,
  onChange,
  addNewItem,
  hideAddButton,
}) {
  return (
    <Paper
      component="form"
      sx={{
        p: "2px 4px",
        display: "flex",
        alignItems: "center",
        maxWidth: 400,
        width: "100%",
      }}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Enter a word"
        inputProps={{ "aria-label": "Enter a word" }}
        value={value}
        onChange={onChange}
        disabled={hideAddButton}
      />
      {!hideAddButton && (
        <IconButton
          type="submit"
          sx={{ p: "10px" }}
          aria-label="Add"
          onClick={addNewItem}
        >
          <AddCircleOutlined />
        </IconButton>
      )}
    </Paper>
  );
}
function CircularProgressWithLabel(
  props
) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' ,width:100,height:100,mx:'auto',my:2}}>
      <CircularProgress variant="determinate" {...props} size={100} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}
export default Sticker;
