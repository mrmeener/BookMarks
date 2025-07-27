/**
 * BookMark Manager - User Bookmarks (JSONP)
 * Personal bookmarks imported from browsers
 * 
 * @author wkdr3
 * @version 1.0.0
 * @created 2025-07-27
 * @description JSONP wrapper for user bookmarks to enable local file loading
 * @licence MIT
 */

// Load user bookmarks if BookMark Manager is available
if (typeof window !== 'undefined' && window.bookmarkApp && window.bookmarkApp.loadUserBookmarks) {
    window.bookmarkApp.loadUserBookmarks({"categories":[{"bookmarks":[{"tags":["imported","edge"],"url":"https://support.lenovo.com/","name":"Lenovo Support","description":"Imported from Edge","logo":""},{"tags":["imported","edge"],"url":"https://www.lenovo.com/","name":"Lenovo","description":"Imported from Edge","logo":""},{"tags":["imported","edge"],"url":"https://consroute.mcafee.com/app?csrc=browserfavaffid=714clicksrc=browserfav","name":"McAfee","description":"Imported from Edge","logo":""},{"tags":["imported","edge"],"url":"https://www.amazon.co.uk/","name":"Amazon.co.uk","description":"Imported from Edge","logo":""}],"id":"personal---bookmarks-bar","description":"Personal bookmarks imported from browser","colour":"#6c757d","name":"Personal - Bookmarks Bar"},{"bookmarks":[{"tags":["imported","edge"],"url":"http://www.dellauction.com/","name":"Dell Auction","description":"Imported from Edge","logo":""},{"tags":["imported","edge"],"url":"http://www.dell.com/","name":"Dell","description":"Imported from Edge","logo":""},{"tags":["imported","edge"],"url":"http://www.dell.com/support/home","name":"Support.Dell.Com","description":"Imported from Edge","logo":""}],"id":"personal---bookmarks-bar---dell","description":"Personal bookmarks imported from browser","colour":"#6c757d","name":"Personal - Bookmarks Bar \u003e Dell"}],"_metadata":{"version":"1.0.0","licence":"MIT","title":"BookMark Manager - User Data File","format":"JSON","description":"Personal bookmarks imported from browsers","importDate":"2025-07-27 15:04:27","created":"2025-07-27","author":"wkdr3"},"settings":{"userBookmarks":true,"defaultTheme":"corporate-blue","version":"1.0.0"}});
} else {
    console.warn('BookMark Manager not found - user bookmarks not loaded');
}
