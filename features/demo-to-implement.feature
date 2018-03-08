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

Scenario: Response value contains
    When GET request to "/users"
    And response "data.id" is "test"