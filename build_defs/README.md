# Cool things

* Gemini-test
  ```
  gemini_test(
    srcs=["//react-component:examples"],
    config=".gemini.js",
    glob("gemini/**/*.png")
  )
  ```
  Runs a docker container with gemini selenium-standalone
