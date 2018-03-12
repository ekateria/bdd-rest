Feature: Demo feature

Background:
    Given base url is "https://reqres.in/api"

# {
#     "books": [
#         {
#             "id": 1,
#             "title": "title 1",
#             "authors": [
#                 {
#                     "name": "author 1"
#                 }
#             ]
#         },
#         {
#             "id": 2,
#             "title": "title 2",
#             "authors": [
#                 {
#                     "name": "author 2"
#                 },
#                 {
#                     "name": "author 3"
#                 }
#             ]
#         }
#     ]
# }

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
