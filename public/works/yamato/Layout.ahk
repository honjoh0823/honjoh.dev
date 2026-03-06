SetCapsLockState, AlwaysOff  ; CapsLockトグル無効化

; 修飾キーが押されていない場合のみ、以下のリマップを有効にする
#If !GetKeyState("Ctrl","P") && !GetKeyState("Alt","P") && !GetKeyState("LWin","P") && !GetKeyState("RWin","P")

; 大和配列
q::m
w::y
e::r
r::w
t::f
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
h::p
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

; 条件ブロックを終了
#If

; ===== 左手マッピング（PowerToysから移行） =====
<+Space::SendInput {Enter}      ; 左Shift+Space = Enter
<^Space::SendInput {Delete}     ; 左Ctrl+Space = Delete
CapsLock & Space::SendInput {Backspace} ; CapsLock+Space = Backspace
CapsLock & a::SendInput {Left}
CapsLock & s::SendInput {Up}
CapsLock & d::SendInput {Down}
CapsLock & f::SendInput {Right}
CapsLock::return  ; CapsLock単体は無効

; ===== 右手側物理キー完全無効化（クセ矯正用） =====
>+Enter::SetCapsLockState % GetKeyState("CapsLock","T") ? "Off" : "On" ; 右Shift+Enter = CapsLockトグル
$Enter::return
$Backspace::return
$Delete::return