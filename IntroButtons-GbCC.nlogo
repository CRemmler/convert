;; OPTIONAL
;; These declarations make variables available at each of the three "levels" of NetLogo
;; If you need additional variables, add these between the [ ]'s.
;; Extra spaces are generally ignored, so you can line text up to look nicer

globals     [ gdata1 gdata2 welcome-student welcome-teacher] ;; available anywhere in the model
turtles-own [ tdata1 tdata2 ] ;; only for turtles
patches-own [ pdata1 pdata2 ] ;; only for patches



;;  ====================================================
;;  INSERT PROCEDURES BELOW (BETWEEN the words TO & END)
;;  ====================================================
;;  Note: To get started, cou can cut and paste directly from the text window
;;  in the interface to the myproc01 or myproc02 procedures below
;;  If you make a new procedure type the procedure name into the Command Center of the Interface
;;  to run it or use an existing button as the name of your procedure (e.g., use myproc02)



to myproc01       ;; change the name of the procedure, if you want, from myproc01 to whatever you want
;; Insert commands here (replace this comment line OR press return and then paste on next line)
end


to myproc02
;; Insert commands here
end


to myproc03
;; Insert commands here
end

to closedfigure  ;; draws a close figure using a variable)
set gdata1 10                                            ;; sets variable gdata1 to the value 10
ask turtles [pd repeat gdata1 [fd 4 rt (360 / gdata1)]]  ;; gdata1 is now used by all the turtles
end


;;  ==================
;;  Modeling Examples
;;  ==================

to fish        ;;change this code to have the movement more fish-like
repeat 10
[
ask turtles [pd fd 2 rt (random 60) - 30]
  wait .2 
]
end


to tree        ;;change this code to make it more tree/plant like
set gdata1 5
set gdata2 4
ask turtles [pd]
ask turtles [set tdata1 gdata2]
ask turtles [fd tdata1]
repeat gdata1 [
ask turtles [
  lt 40
  hatch 1 [rt 80]
  ]
ask turtles [fd tdata1]
ask turtles [set tdata1 tdata1 - (gdata2 / (gdata1 + 1))]

  ]
end

;;;;;;;;;;;;;;;;;;;;;;;
;; HubNet Procedures ;;
;;;;;;;;;;;;;;;;;;;;;;;

to share-code
  gbcc-broadcast ["canvas"]
  gbcc-set "code example" code-example
end

to gbcc-gallery-click [ user-id ]
  set code-example gbcc-get-from-user user-id "code example"
end

@#$#@#$#@
GRAPHICS-WINDOW
255
10
798
554
-1
-1
16.21212121212121
1
10
1
1
1
0
1
1
1
-16
16
-16
16
0
0
1
ticks
30.0

BUTTON
126
28
182
61
crt 1
crt 1\n\noutput-print \"crt 1\"\n
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
184
28
243
61
crt 100
crt 100\n\noutput-print \"crt 100\"\n
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
12
81
79
114
fd 5
ask turtles [fd 5]\n\noutput-print \"ask turtles [fd 5]\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
11
27
74
60
ca
ca\nclear-output\noutput-print \"ca\"\n
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
11
117
66
150
pd
ask turtles [pd]\n\noutput-print \"ask turtles [pd]\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
13
312
131
345
set pcolor red
ask patches [set pcolor red]\n\noutput-print \"ask patches [set pcolor red]\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
67
117
130
150
pu
ask turtles [pu]\n\noutput-print \"ask turtles [pu]\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
13
347
245
380
if pxcor mod 2 = 0 [set pcolor green]
ask patches [if pxcor mod 2 = 0 [set pcolor green]]\n\noutput-print \"ask patches [if pxcor mod 2 = 0 [set pcolor green]]\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
124
152
246
185
fd (random 100 / 20)
ask turtles [fd (random 100 / 20)]\n\noutput-print \"ask turtles [fd (random 100 / 20)]\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
13
382
245
415
set pcolor ((random 13) * 10 + 5)
ask patches [set pcolor ((random 13) * 10 + 5)]\n\noutput-print \"ask patches [set pcolor ((random 13) * 10 + 5)]\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
135
312
244
345
set pcolor black
ask patches [set pcolor black]\n\noutput-print \"ask patches [set pcolor black]\"\n
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
11
152
122
185
fd random 5 
ask turtles [fd random 5]\n\noutput-print \"ask turtles [fd random 5]\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
132
117
187
150
st
ask turtles [st]\n\noutput-print \"ask turtles [st]\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
189
118
246
151
ht
ask turtles [ht]\n\noutput-print \"ask turtles [ht]\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
OUTPUT
17
455
247
572
12
TEXTBOX
11
65
75
83
TURTLES
11
0.0
1
TEXTBOX
9
10
70
28
OBSERVER
11
0.0
1
TEXTBOX
13
295
163
313
PATCHES
11
0.0
1
BUTTON
11
186
66
219
rt 10
ask turtles [rt 10]\n\noutput-print \"ask turtles [rt 10]\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
67
186
122
219
lt 5
ask turtles [lt 10]\n\noutput-print \"ask turtles [lt 10]\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
124
186
246
219
rt (random 60 - 30)
ask turtles [rt (random 60 - 30) ]\n\noutput-print \"ask turtles [rt (random 60 - 30)]\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
83
81
168
114
fd -5
ask turtles [fd -5]\n\noutput-print \"ask turtles [fd -5]\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
174
81
247
114
bk 5
ask turtles [bk 5]\n\noutput-print \"ask turtles [bk 5]\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
11
220
246
253
ask turtles [set pcolor pink]
ask turtles [set pcolor pink]\n\noutput-print \"ask turtles [set pcolor pink]\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
TEXTBOX
18
422
249
450
CODE ::   Copy and Paste to Keep Copy or Enter in myproc01 in NetLogo Code Tab
11
105.0
1
BUTTON
127
256
246
289
repeat 4 [fd 5 rt 90]
ask turtles [repeat 4 [fd 5 rt 90]]\n\noutput-print \"ask turtles [repeat 4 [fd 5 rt 90]]\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
822
82
917
115
NIL
myproc01
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
823
127
918
160
NIL
myproc02
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
TEXTBOX
823
13
960
97
myproc01 and 02 need your CODE to be entered in procedures to work (in NetLog Code Tab)
11
105.0
1
BUTTON
828
231
898
264
fish
if count turtles > 0 [fish]\noutput-print \"fish\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
828
270
899
303
tree
if count turtles > 0 [tree]\noutput-print \"tree\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
BUTTON
12
256
124
289
set heading 45
ask turtles [set heading 45]\n\noutput-print \"ask turtles [set heading 45]\"
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
TEXTBOX
825
189
954
217
Modify procedures to make more realistic
11
105.0
1
TEXTBOX
79
38
127
56
-then->\n
11
0.0
1
INPUTBOX
806
365
1035
538
code-example
NIL
1
1
String
BUTTON
806
545
1035
578
share
share-code
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL
1
@#$#@#$#@
## WHAT IS IT?
This section could give a general understanding of what the model is trying to show or explain.
## HOW IT WORKS
This section could explain what rules the agents use to create the overall behavior of the model.
## HOW TO USE IT
This section could explain how to use the model, including a description of each of the items in the interface tab.
## THINGS TO NOTICE
This section could give some ideas of things for the user to notice while running the model.
## THINGS TO TRY
This section could give some ideas of things for the user to try to do (move sliders, switches, etc.) with the model.
## EXTENDING THE MODEL
This section could give some ideas of things to add or change in the procedures tab to make the model more complicated, detailed, accurate, etc.
## NETLOGO FEATURES
This section could point out any especially interesting or unusual features of NetLogo that the model makes use of, particularly in the Procedures tab.  It might also point out places where workarounds were needed because of missing features.
## RELATED MODELS
This section could give the names of models in the NetLogo Models Library or elsewhere which are of related interest.
## CREDITS AND REFERENCES
This section could contain a reference to the model's URL on the web if it has one, as well as any other necessary credits or references.
@#$#@#$#@
default
true
0
Polygon -7500403 true true 150 5 40 250 150 205 260 250
airplane
true
0
Polygon -7500403 true true 150 0 135 15 120 60 120 105 15 165 15 195 120 180 135 240 105 270 120 285 150 270 180 285 210 270 165 240 180 180 285 195 285 165 180 105 180 60 165 15
arrow
true
0
Polygon -7500403 true true 150 0 0 150 105 150 105 293 195 293 195 150 300 150
box
false
0
Polygon -7500403 true true 150 285 285 225 285 75 150 135
Polygon -7500403 true true 150 135 15 75 150 15 285 75
Polygon -7500403 true true 15 75 15 225 150 285 150 135
Line -16777216 false 150 285 150 135
Line -16777216 false 150 135 15 75
Line -16777216 false 150 135 285 75
bug
true
0
Circle -7500403 true true 96 182 108
Circle -7500403 true true 110 127 80
Circle -7500403 true true 110 75 80
Line -7500403 true 150 100 80 30
Line -7500403 true 150 100 220 30
butterfly
true
0
Polygon -7500403 true true 150 165 209 199 225 225 225 255 195 270 165 255 150 240
Polygon -7500403 true true 150 165 89 198 75 225 75 255 105 270 135 255 150 240
Polygon -7500403 true true 139 148 100 105 55 90 25 90 10 105 10 135 25 180 40 195 85 194 139 163
Polygon -7500403 true true 162 150 200 105 245 90 275 90 290 105 290 135 275 180 260 195 215 195 162 165
Polygon -16777216 true false 150 255 135 225 120 150 135 120 150 105 165 120 180 150 165 225
Circle -16777216 true false 135 90 30
Line -16777216 false 150 105 195 60
Line -16777216 false 150 105 105 60
car
false
0
Polygon -7500403 true true 300 180 279 164 261 144 240 135 226 132 213 106 203 84 185 63 159 50 135 50 75 60 0 150 0 165 0 225 300 225 300 180
Circle -16777216 true false 180 180 90
Circle -16777216 true false 30 180 90
Polygon -16777216 true false 162 80 132 78 134 135 209 135 194 105 189 96 180 89
Circle -7500403 true true 47 195 58
Circle -7500403 true true 195 195 58
circle
false
0
Circle -7500403 true true 0 0 300
circle 2
false
0
Circle -7500403 true true 0 0 300
Circle -16777216 true false 30 30 240
cow
false
0
Polygon -7500403 true true 200 193 197 249 179 249 177 196 166 187 140 189 93 191 78 179 72 211 49 209 48 181 37 149 25 120 25 89 45 72 103 84 179 75 198 76 252 64 272 81 293 103 285 121 255 121 242 118 224 167
Polygon -7500403 true true 73 210 86 251 62 249 48 208
Polygon -7500403 true true 25 114 16 195 9 204 23 213 25 200 39 123
cylinder
false
0
Circle -7500403 true true 0 0 300
dot
false
0
Circle -7500403 true true 90 90 120
face happy
false
0
Circle -7500403 true true 8 8 285
Circle -16777216 true false 60 75 60
Circle -16777216 true false 180 75 60
Polygon -16777216 true false 150 255 90 239 62 213 47 191 67 179 90 203 109 218 150 225 192 218 210 203 227 181 251 194 236 217 212 240
face neutral
false
0
Circle -7500403 true true 8 7 285
Circle -16777216 true false 60 75 60
Circle -16777216 true false 180 75 60
Rectangle -16777216 true false 60 195 240 225
face sad
false
0
Circle -7500403 true true 8 8 285
Circle -16777216 true false 60 75 60
Circle -16777216 true false 180 75 60
Polygon -16777216 true false 150 168 90 184 62 210 47 232 67 244 90 220 109 205 150 198 192 205 210 220 227 242 251 229 236 206 212 183
fish
false
0
Polygon -1 true false 44 131 21 87 15 86 0 120 15 150 0 180 13 214 20 212 45 166
Polygon -1 true false 135 195 119 235 95 218 76 210 46 204 60 165
Polygon -1 true false 75 45 83 77 71 103 86 114 166 78 135 60
Polygon -7500403 true true 30 136 151 77 226 81 280 119 292 146 292 160 287 170 270 195 195 210 151 212 30 166
Circle -16777216 true false 215 106 30
flag
false
0
Rectangle -7500403 true true 60 15 75 300
Polygon -7500403 true true 90 150 270 90 90 30
Line -7500403 true 75 135 90 135
Line -7500403 true 75 45 90 45
flower
false
0
Polygon -10899396 true false 135 120 165 165 180 210 180 240 150 300 165 300 195 240 195 195 165 135
Circle -7500403 true true 85 132 38
Circle -7500403 true true 130 147 38
Circle -7500403 true true 192 85 38
Circle -7500403 true true 85 40 38
Circle -7500403 true true 177 40 38
Circle -7500403 true true 177 132 38
Circle -7500403 true true 70 85 38
Circle -7500403 true true 130 25 38
Circle -7500403 true true 96 51 108
Circle -16777216 true false 113 68 74
Polygon -10899396 true false 189 233 219 188 249 173 279 188 234 218
Polygon -10899396 true false 180 255 150 210 105 210 75 240 135 240
house
false
0
Rectangle -7500403 true true 45 120 255 285
Rectangle -16777216 true false 120 210 180 285
Polygon -7500403 true true 15 120 150 15 285 120
Line -16777216 false 30 120 270 120
leaf
false
0
Polygon -7500403 true true 150 210 135 195 120 210 60 210 30 195 60 180 60 165 15 135 30 120 15 105 40 104 45 90 60 90 90 105 105 120 120 120 105 60 120 60 135 30 150 15 165 30 180 60 195 60 180 120 195 120 210 105 240 90 255 90 263 104 285 105 270 120 285 135 240 165 240 180 270 195 240 210 180 210 165 195
Polygon -7500403 true true 135 195 135 240 120 255 105 255 105 285 135 285 165 240 165 195
line
true
0
Line -7500403 true 150 0 150 300
line half
true
0
Line -7500403 true 150 0 150 150
pentagon
false
0
Polygon -7500403 true true 150 15 15 120 60 285 240 285 285 120
person
false
0
Circle -7500403 true true 110 5 80
Polygon -7500403 true true 105 90 120 195 90 285 105 300 135 300 150 225 165 300 195 300 210 285 180 195 195 90
Rectangle -7500403 true true 127 79 172 94
Polygon -7500403 true true 195 90 240 150 225 180 165 105
Polygon -7500403 true true 105 90 60 150 75 180 135 105
plant
false
0
Rectangle -7500403 true true 135 90 165 300
Polygon -7500403 true true 135 255 90 210 45 195 75 255 135 285
Polygon -7500403 true true 165 255 210 210 255 195 225 255 165 285
Polygon -7500403 true true 135 180 90 135 45 120 75 180 135 210
Polygon -7500403 true true 165 180 165 210 225 180 255 120 210 135
Polygon -7500403 true true 135 105 90 60 45 45 75 105 135 135
Polygon -7500403 true true 165 105 165 135 225 105 255 45 210 60
Polygon -7500403 true true 135 90 120 45 150 15 180 45 165 90
square
false
0
Rectangle -7500403 true true 30 30 270 270
square 2
false
0
Rectangle -7500403 true true 30 30 270 270
Rectangle -16777216 true false 60 60 240 240
star
false
0
Polygon -7500403 true true 151 1 185 108 298 108 207 175 242 282 151 216 59 282 94 175 3 108 116 108
target
false
0
Circle -7500403 true true 0 0 300
Circle -16777216 true false 30 30 240
Circle -7500403 true true 60 60 180
Circle -16777216 true false 90 90 120
Circle -7500403 true true 120 120 60
tree
false
0
Circle -7500403 true true 118 3 94
Rectangle -6459832 true false 120 195 180 300
Circle -7500403 true true 65 21 108
Circle -7500403 true true 116 41 127
Circle -7500403 true true 45 90 120
Circle -7500403 true true 104 74 152
triangle
false
0
Polygon -7500403 true true 150 30 15 255 285 255
triangle 2
false
0
Polygon -7500403 true true 150 30 15 255 285 255
Polygon -16777216 true false 151 99 225 223 75 224
truck
false
0
Rectangle -7500403 true true 4 45 195 187
Polygon -7500403 true true 296 193 296 150 259 134 244 104 208 104 207 194
Rectangle -1 true false 195 60 195 105
Polygon -16777216 true false 238 112 252 141 219 141 218 112
Circle -16777216 true false 234 174 42
Rectangle -7500403 true true 181 185 214 194
Circle -16777216 true false 144 174 42
Circle -16777216 true false 24 174 42
Circle -7500403 false true 24 174 42
Circle -7500403 false true 144 174 42
Circle -7500403 false true 234 174 42
turtle
true
0
Polygon -10899396 true false 215 204 240 233 246 254 228 266 215 252 193 210
Polygon -10899396 true false 195 90 225 75 245 75 260 89 269 108 261 124 240 105 225 105 210 105
Polygon -10899396 true false 105 90 75 75 55 75 40 89 31 108 39 124 60 105 75 105 90 105
Polygon -10899396 true false 132 85 134 64 107 51 108 17 150 2 192 18 192 52 169 65 172 87
Polygon -10899396 true false 85 204 60 233 54 254 72 266 85 252 107 210
Polygon -7500403 true true 119 75 179 75 209 101 224 135 220 225 175 261 128 261 81 224 74 135 88 99
wheel
false
0
Circle -7500403 true true 3 3 294
Circle -16777216 true false 30 30 240
Line -7500403 true 150 285 150 15
Line -7500403 true 15 150 285 150
Circle -7500403 true true 120 120 60
Line -7500403 true 216 40 79 269
Line -7500403 true 40 84 269 221
Line -7500403 true 40 216 269 79
Line -7500403 true 84 40 221 269
x
false
0
Polygon -7500403 true true 270 75 225 30 30 225 75 270
Polygon -7500403 true true 30 75 75 30 270 225 225 270
@#$#@#$#@
NetLogo 5.0
@#$#@#$#@
@#$#@#$#@
@#$#@#$#@
@#$#@#$#@
@#$#@#$#@
default
0
-0.2 0 0 1
0 1 1 0
0.2 0 0 1
link direction
true
0
Line -7500403 true 150 150 90 180
Line -7500403 true 150 150 210 180
@#$#@#$#@
@#$#@#$#@