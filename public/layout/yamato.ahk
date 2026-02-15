; Yamato Layout (大和配列) for AutoHotKey
; Author: Honjoh Nobuhiro
; https://honjoh.dev/layout
;
; When Ctrl, Alt, or Win is held, reverts to QWERTY for shortcuts.
; Shift alone keeps Yamato layout active.

#If !GetKeyState("Ctrl","P") && !GetKeyState("Alt","P") && !GetKeyState("LWin","P") && !GetKeyState("RWin","P")

; Yamato Layout
q::m
w::y
e::r
r::w
t::p
y::x
u::l
i::q
o::c
p::'
a::k
s::s
d::t
f::n
g::h
h::f
j::a
k::o
l::i
z::z
x::d
c::b
v::g
b::j
n::v
m::u
sc027::e
-::sc027
'::/
,::-
.::,
/::.

; End conditional block
#If
