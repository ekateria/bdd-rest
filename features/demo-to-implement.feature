Feature: Demo feature

Background:
    Given base url is "https://reqres.in/api"

#  response for /users is
#  {
#    page: 1,
#    per_page: 3,
#    total: 12,
#    total_pages: 4,
#    data: [
#       {
#          id: 1,
#          first_name: "George",
#          last_name: "Bluth",
#          avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/calebogden/128.jpg"
#       },
#       {
#          id: 2,
#          first_name: "Janet",
#          last_name: "Weaver",
#          avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/josephstein/128.jpg"
#       },
#       {
#          id: 3,
#          first_name: "Emma",
#          last_name: "Wong",
#          avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/olegpogodaev/128.jpg"
#       }
#   ]
#  }

# GET and check response

Scenario: Response value contains in table
    Given base url is "http://localhost:3000"
    When GET request to "/books"
    Then response "books[1].authors.name" has items 
    |  author 2  |
    |  author 3  |
    

# user should have message that "avatar1" is not key in json

Scenario: Response array values
    When GET request to "/users"
    Then response "data" has items 
    |  id  | first_name  |  last_name | avatar1                                                              |
    |  1   | George      |  Bluth     | https://s3.amazonaws.com/uifaces/faces/twitter/calebogden/128.jpg   |
    |  2   | Janet       |  Weaver    | https://s3.amazonaws.com/uifaces/faces/twitter/josephstein/128.jpg  |
    |  3   | Emma        |  Wong      | https://s3.amazonaws.com/uifaces/faces/twitter/olegpogodaev/128.jpg |
