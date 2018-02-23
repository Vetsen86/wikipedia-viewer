$(document).ready(function () {
  /*This program uses the WikiMedia api. Documentation can be found at:
  https://www.mediawiki.org/wiki/API:Main_page*/

  //API sandbox for WikiMedia api: https://en.wikipedia.org/wiki/Special:ApiSandbox

  //Links to a random wikipedia article when user clicks the "random" link
  //https://en.wikipedia.org/w/api.php?action=query&format=json&prop=info&generator=random&inprop=url&grnnamespace=0
  $("#random").on('click', function() {
    $.ajax({
      url: 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=info&generator=random&inprop=url&grnnamespace=0',
      type: 'GET',
      dataType: 'jsonp',
      success(response) {
        //Object.keys() is necessary because the object key changes with each request
        /*Example
        {
          query: {
            pages: {
              9473998: {  <--- This number is always different
               (page data)
              },
              7352154: {  <--- so is this number
               (next page data)
              }
            }
          }
        }
        */
        const pageArray = Object.keys(response.query.pages);
        const url = response.query.pages[pageArray[0]].fullurl;
        window.location = url;
      },
      error (jqXHR, status, errorThrown) {
        console.log(jqXHR);
      }
    });
  });


  //uses Wikipedia's api to search for the string user enters into search form
  /*https://en.wikipedia.org/w/api.php?action=query&format=json&prop=info%7Cextracts&generator=search&inprop=url&exchars=200&exlimit=10&exintro=1
  &gsrsearch=(search term goes here)&gsrnamespace=0&gsrlimit=10*/

  //prevents page from reloading on form submit and pulls input for wikipedia search
  $('form').submit(function(e){
    e.preventDefault();
    $(".result").addClass("hidden");
    let term = $("#search").val();
    term = term.toLowerCase().replace(/\s+/g, "%20");
    const wikiUrl =`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=info%7Cextracts&generator=search&inprop=url&exchars=200&exlimit=10&exintro=1&gsrsearch=${term}&gsrnamespace=0&gsrlimit=10`;
    //request to wikimedia API, jsonp is necessary due to CORS access-control-allow-origin header not being present
    $.ajax({
      url: wikiUrl,
      type: 'GET',
      dataType: 'jsonp',
      success(response) {
        const idArray = Object.keys(response.query.pages);
        const pages = response.query.pages;
        const pageArray = indexSort(pages, idArray);
        pageInfoDisplay(pageArray);
        console.log(response);
      },
      error (jqXHR, status, errorThrown) {
        console.log(jqXHR);
      }
    });
  });

  /*This is a crazy experiment. I'm trying to sort the response of the wikipedia API by their index, aka relevancy.
  Holy monkey nuts I actually did it. Wasn't even that hard, actually.
  Here's how I did it: .sort() can sort objects in an array by taking a numerical property
  of the object and sorting them by using that property's value. However, the objects must be
  in an array first. So, this function puts the returned pages into an array and then sorts
  them according to the value of their index property.*/
  const indexSort = (pages, idArray) => {
    let pageArray = [];
    for (i = 0; i < idArray.length; i++) {
      pageArray.push(pages[idArray[i]]);
    }
    pageArray.sort(function(obj1, obj2) {
      return obj1.index - obj2.index;
    });
    return pageArray;
  };

  /*This function iterates through the previously created sorted array of pages
  and generates a list of search results from them.
  Also: a cool staggered fade-in slide animation!!*/
  const pageInfoDisplay = (pages) => {
    let url = "";
    let title = "";
    let extract = "";
    let target = "";
    for (i = 0; i < pages.length; i++) {
      url = pages[i].fullurl;
      title = pages[i].title;
      extract = pages[i].extract;
      target = "#result_" + i;
      let delay = i * 100;
      $(target).html("<a href='" + url + "'>" + title + "</a><br><p>" + extract + "</p>");
      $(target).addClass("animated fadeInRight");
      $(target).removeClass("hidden").css("animation-delay", delay + "ms");
    }
  };


});
