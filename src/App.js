import {
  Divider,
  Box,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Fab,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  Autocomplete,
  RadioGroup,
  Radio,
  FormControlLabel,
  Pagination,
  Stack,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Collapse,
  styled,
  CardActionArea,
  Menu,
  MenuItem


} from "@mui/material";

import { LibraryBooks, Feed, Delete, Bookmark, Add, Refresh, Check, Downloading, MoreVert } from "@mui/icons-material";
import * as React from "react";
import * as api from "./access.js";
import { Routes, Route, Link } from "react-router-dom";
import localforage from "localforage";


const symbolmap = {
  "category-slash": "M/M",
  "category-femslash": "F/F",
  "category-gen": "Gen",
  "category-het": "F/M",
  "category-multi": "Multi",
  "category-none": "None",
  "category-other": "Other",
  "rating-general-audience": "General Audiences",
  "rating-explicit": "Explicit",
  "rating-mature": "Mature",
  "rating-notrated": "Not Rated",
  "rating-teen": "Teen",
  "complete-yes": "Completed",
  "complete-no": "Incomplete",
  "warning-yes": "Warning",
  "warning-no": "No Warnings",
  "warning-choosenotto": "Chose not to warn",
  "external-work": "External Work",

  
  
}


function BottomNavBar() {
  const [value, setValue] = React.useState(0);
  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
      variant="outlined"
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction label="Library" icon={<LibraryBooks />} value="/" to="/" component={Link} />
        <BottomNavigationAction label="Feeds" icon={<Feed />} value="/feeds" to="/feeds" component={Link} />
        <BottomNavigationAction label="Bookmarks" icon={<Bookmark />} value="/bookmarks" to="/bookmarks" component={Link} />
      </BottomNavigation>
    </Paper>
  );
}



function LocalWorkItem({data}) {
  // Component for works saved in library, used for Library and Bookmarks
  return (
    <>
    <ListItem>
      <ListItemText
        primary={
          <Typography
            component="h2"
            variant="h5"
            color="text.primary"
          >
            {data["title"]}
          </Typography>
        }
        secondary={
          <Typography
            sx={{ display: "inline" }}
            component="span"
            variant="body2"
            color="text.secondary"
          >
            by {data["author"][0].text}
          </Typography>
        }
      />
    </ListItem>
    <Divider variant="middle" component="li" />
    </>
  )
}


function FeedWorkItem({data, addedLibrary}) {
  // Component for works loaded from a feed

  const [expanded, setExpanded] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [inLib, setInLib] = React.useState(addedLibrary)

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  React.useEffect(() => {
    setInLib(addedLibrary)
    setLoading(false)
    setExpanded(false)
  }, [data])

  return (
    <Card
    variant="outlined"
    >
      
      <CardHeader
      disableTypography={true}
      title={<CardActionArea ><Typography variant="h5" color="text.primary">{data["title"]}</Typography></CardActionArea>}
      subheader={<Typography variant="body2" color="text.secondary">{`by ${data["author"][0] ? data["author"].map(v => v.text).join(", ") : "Anonymous"}`}</Typography>}
      action={
        !inLib ?
        <IconButton 
        aria-label="add"
        onClick={() => {
          setLoading(true)
          api.getWork(data["id"]).then(() => setInLib(true)).catch(err => {console.log(err); setLoading(false)})
        }}
        >
          {loading ? <Downloading/> : <Add />}
        </IconButton> : <IconButton><Check/></IconButton>
      }
      />
      <CardActionArea onClick={handleExpandClick}>
        <CardContent>
          <Typography
          variant="body2"
          color="text.secondary"
          >
            {data["symbols"].map(v => symbolmap[v.split(" ")[0]]).join(", ")}
          </Typography>
        </CardContent>
        <Collapse
        in={expanded}
        timeout="auto"
        unmountOnExit
        >
          <Typography variant="h5" ml={2} mr={2}>
            Summary:
          </Typography>
          {data["summary"] ? data["summary"].split("\n").map((text, i) => 
          <Typography key={i} paragraph ml={2} mr={2}>
            {text}
          </Typography>) : ""}
          
        </Collapse>
      </CardActionArea>

      
    </Card>
  )
}

function DropdownMenu({children}) {
 

  return (
    <>
      
      
    </>
  )
}

function LibraryView() {
  const [works, setWorks] = React.useState([])
  const [dialog, setDialog] = React.useState(false)
  const [dialoginput, setDialoginput] = React.useState("")


  function update() {
    let wlist = [];
    api.listWorks().then(keys => keys.forEach((v) => {
      api.getWork(v).then((i) => {
        wlist.push(i);
        if (Object.keys(keys).length === wlist.length) {
          setWorks(wlist);
        }
      })
    }))
  }

  function closeDialog() {
    setDialog(false)
    setDialoginput("")
  }

  React.useEffect(() => {
    update() 
  }, [])
  return (
    <Box sx={{ width: "100%" }}>
      <AppBar>
        <Toolbar sx={{ width: "100%" }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Library
          </Typography>

          <IconButton onClick={() => {
            
          }}>
            <Delete />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{
          width: "100%",
          margin: "50px 0px 50px 0px",
        }}
      >
        <List
          sx={{
            width: "100%",
            bgcolor: "background.paper",
            marginBottom: "150px",
          }}
        >
          {works.map((e,i) => <LocalWorkItem key={i} data={e} />)}
        </List>
      </Box>
      
      <Fab 
      sx={{position: "fixed", bottom: "75px", right: "25px"}}
      // onClick={() => }
      onClick={() => setDialog(true)}
      color="primary" 
      aria-label="add">
        <Add />
      </Fab>
      <Dialog 
      open={dialog} onClose={closeDialog}
      fullWidth={true}
      >
        <DialogTitle>Add Work to Library</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter Work ID or URL
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="workid"
            label="Input Work"
            type="text"
            fullWidth
            variant="standard"
            onChange={e => setDialoginput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={() => {api.getWork(dialoginput.match(/\d+/)[0]).then(() => {setTimeout(update, 100)}); closeDialog()}}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
function FeedsView() {
  const [dialog, setDialog] = React.useState(false)
  const [nameInput, setNameInput] = React.useState("")
  const [pathInput, setPathInput] = React.useState("")
  function closeDialog() {
    setDialog(false)
    setNameInput("")
    setPathInput("")
  }

  const [pageDialog, setPageDialog] = React.useState(false)
  const [pageInput, setPageInput] = React.useState("")
  function closePageDialog() {
    setPageDialog(false)
    setPageInput("")
  }

  const [searchValue, setSearchValue] = React.useState(null)
  const [feedList, setFeedList] = React.useState([])
  const [feed, setFeed] = React.useState([])
  const [page, setPage] = React.useState(1)
  const [listWorks, setListWorks] = React.useState([])

  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const menuOpen = Boolean(anchorEl);
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };


  function update(keepEmpty = false) {
    console.log("UPDATE: ", searchValue, feedList)
    if (searchValue) {
      api.getfeed(searchValue['id'], page).then(v => setFeed(v))
    } else if (document.activeElement.tagName.toLowerCase() === 'input'){

    } else if(feedList[0]) {
      setSearchValue(feedList[0])
    }
  }
  function updateList() {
    api.listfeed().then(v => {setFeedList(v); console.log("feedlist", v)}).catch(err => console.log(err))
    // if (!searchValue && feedList[0]) {
    //   setSearchValue(feedList[0])
    // }
  }

  

  React.useEffect(() => {
    api.listWorks().then(ids => setListWorks(ids))
    updateList()
  }, [])
  
  React.useEffect(() => {
    setPage(1)
  }, [searchValue])

  React.useEffect(() => {
    update()
    console.log(searchValue)
  }, [feedList, searchValue, page])
  

  React.useEffect(() => {
    document.querySelectorAll("li > div.MuiPaginationItem-ellipsis").forEach(v => v.onclick = () => setPageDialog(true))
  }, [feed])

  return (
    <Box sx={{ width: "100%" }}>
      <AppBar>
        <Toolbar sx={{ width: "100%" }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Feeds
          </Typography>
          <Autocomplete
          freeSolo
          sx={{ flexGrow: 1 }}
          size="small"
          value={searchValue || null}
          options={feedList}
          renderInput={params => <TextField {...params} variant="filled" label="Feeds"/>}
          onChange={(e,v) => {setSearchValue(v); console.log(v, document.activeElement, e.target, e.target.id.startsWith(document.activeElement.id))}}
          />
          <IconButton
            id="basic-button"
            aria-controls={menuOpen ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? 'true' : undefined}
            onClick={handleMenuClick}
          >
            <MoreVert/>
          </IconButton>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem disabled={true}>Last updated on: {
              new Date(feed ? feed["timeupdated"] : 0).toLocaleString("default", {dateStyle: "medium", timeStyle: "short" })
            }</MenuItem>
            <MenuItem onClick={handleMenuClose}>Refresh</MenuItem>
            <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
            <MenuItem onClick={handleMenuClose}>Set as default</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Stack 
      alignItems="center"
      sx={{
          width: "100%",
          margin: "72px 0px 122px 0px",
        }}
      >
        { feed.json ? <Pagination 

        siblingCount={0} 
        boundaryCount={1}
        page={page}
        count={parseInt(feed.json.pages)} 
        variant="outlined" 
        shape="rounded" 
        onChange={(e,p) => setPage(p)}
        /> : <></>}
        
        <Stack
          sx={{
            width: "100%",
          }}
        >
          {feed.json ? feed.json.works.map((e,i) => <FeedWorkItem key={i} data={e} addedLibrary={listWorks.includes(e.id)}/>) : <></>}
        </Stack>
        { feed.json ? <Pagination 
        siblingCount={0} 
        boundaryCount={1}
        page={page}
        count={parseInt(feed.json.pages)} 
        variant="outlined" 
        shape="rounded" 
        onChange={(e,p) => setPage(p)}
        /> : <></>}
      </Stack>
      
      <Fab 
      sx={{position: "fixed", bottom: "75px", right: "25px"}}
      // onClick={() => }
      onClick={() => setDialog(true)}
      color="secondary" 
      aria-label="add">
        <Add />
      </Fab>
      <Dialog 
      open={dialog} onClose={closeDialog}
      fullWidth={true}
      >
        <DialogTitle>Add Feed</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter Feed
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="feedtitle"
            label="Title"
            type="text"
            fullWidth
            variant="standard"
            onChange={e => setNameInput(e.target.value)}
          />
          <TextField
            autoFocus
            margin="dense"
            id="feedpath"
            label="URL/Path"
            type="text"
            fullWidth
            variant="standard"
            onChange={e => setPathInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={() => {api.addfeed(nameInput.trim(), pathInput).then(id => {setTimeout(() => {updateList(); setSearchValue({label: nameInput.trim(), id: id});closeDialog()}, 100)})}}>Add</Button>
        </DialogActions>
      </Dialog>
      <Dialog 
      open={pageDialog} onClose={closePageDialog}
      fullWidth={true}
      >
        <DialogTitle>Select Page</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Input Page Number
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="feedtitle"
            label="Page"
            type="text"
            fullWidth
            variant="standard"
            onChange={e => setPageInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closePageDialog}>Cancel</Button>
          <Button onClick={() => {setPage(parseInt(pageInput)); closePageDialog()}}>Go</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
function BookmarksView() {
  const [value, setValue] = React.useState([])

  function update() {
    let wlist = [];
    api.listWorks().then((arr) => {
      arr.forEach((v) => {
        api.getWork(v).then((i) => {
          wlist.push(i);
          if (arr.length === wlist.length) {
            setValue(wlist);
          }
        });
      });
      
    });
  }

  React.useEffect(() => {
    // update() 
  }, [])
  return (
    <Box sx={{ width: "100%" }}>
      <AppBar>
        <Toolbar sx={{ width: "100%" }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Bookmarks
          </Typography>

        </Toolbar>
      </AppBar>

      <List
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          margin: "50px 0px 150px 0px",
        }}
      >
        {value.map((e,i) => <LocalWorkItem key={i} data={e}/>)}
      </List>
    </Box>
  )
}


function App() {

  return (
    <div className="App">
      <Box sx={{ width: "100%", height: "100%"}}>

        <Routes>
          <Route path="/" element={<LibraryView/>}/>
          <Route path="/feeds" element={<FeedsView/>}/>
          <Route path="/bookmarks" element={<BookmarksView/>}/>
        </Routes>

        <BottomNavBar />

      </Box>
    </div>
  );
}

export default App;
