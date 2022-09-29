notes:
- Maybe use separate localforage for storing work_* and feed_*
- Also separate localforage as worklist and feedlist

workList                = {ID: {timeadded: UNIXTIMESTAMP}} (timeadded to library)
work_${id}              = Result from /works/:id
work_${id}_blob_${type} = File from /works/:id/download/:type

downloadWorkBlob:
Adds id to download queue then return added status, if id already on queue then return waiting status, if id already in workList then return finished status. ooh what about callbacks??????????????? thats a very non-blocking async single-threaded js idea

getWork:
returns work_${id}

Note: Separate getWork with download code. downloadWork would store all the id's in a buffer and will keep trying to go through them and download all of them.

getWorkBlob:
Try to read work_${id}_blob_${type} if it returns null, then get them from the API (/works/:id/download/:type). Return a Blob object

deleteWork:
First remove the id from workList, then get all the keys in the localStorage, filter them for ones starting with work_${id} and then loop through and remove them





bookmarkList = [{id: ID, timeadded: UNIXTIMESTAMP}] (timeadded to bookmark)

addBookmark:

removeBookmark:


feedsList = {RANDOMFEEDID: {name: USERINPUTNAME, path: AO3PATH, timeadded: UNIXTIMESTAMP, timeupdated: UNIXTIMESTAMP totalPage: PAGECOUNT}}
feed_${feedid}_page_${page} = {json: works result from /feed/:path/1, timeupdated: UNIXTIMESTAMP}

addFeed(path, name):
get first page of feed, add to feedsList

removeFeed(feedid):
remove feed from feedsList, get all the keys in localstorage, filter them for ones starting with feed_${feedid}

listFeed:
returns bookmarkList, creates bookmarkList if null

getFeed(feedid, page):
check if feed item exists
if true
    check if feed item timeupdated is older than feed timeupdated
    if older or equal
        fetch feed and store in localstorage
    if newer
        get from localstorage
if false
    fetch feed and store in localstorage 

updateFeed(feedid):
update feed timeupdated to Date.now(), getFeed(feedid, 1), update pagecount









