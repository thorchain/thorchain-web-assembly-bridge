package main

import (
	"fmt"
	"net/http"
)

func main() {
	fmt.Println("Visit http://localhost:8080/js/example")
	http.ListenAndServe(":8080", http.FileServer(http.Dir(".")))
}
