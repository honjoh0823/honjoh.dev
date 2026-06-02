#Requires AutoHotkey v2.0
#SingleInstance Force
A_MaxHotkeysPerInterval := 200

; =========================================================================
; Left.v1.ahk - Left Hand Fujin Layout (風神配列)
; =========================================================================
; Left hand  = Fujin (風神配列)
; Right hand = Yamato (大和配列)
; =========================================================================
; Note: For full Yamato layout, use HonjohLayout.ahk instead.
; =========================================================================
; v1 Changes (from v3.0.10):
;   - CapsLock: q=f, w=v, e=c, r=q, t=l
;   - Right-hand remap: y=f (was x)
;   - CapsLock+g (/ ?) removed, CapsLock+z (/ ?) added
;   - CapsLock+[Y]=x (was f pass-through)
; =========================================================================

SetCapsLockState "AlwaysOff"

; --- Alt+B: Toggle Enable/Disable ---
#SuspendExempt
!b:: {
    Suspend -1
    if A_IsSuspended {
        TraySetIcon "shell32.dll", 132  ; Red X — suspended
        ToolTip "lu1: OFF"
    } else {
        TraySetIcon "shell32.dll", 3    ; Green — active
        ToolTip "lu1: ON"
    }
    SetTimer () => ToolTip(), -2000
}
#SuspendExempt False

; --- Global State ---
Global SpaceHeld := false
Global SpaceUsedAsModifier := false
Global LAltUsedAsU := false
Global CapsActive := false
Global SpaceCapsMode := false
Global LastCharWasVowel := false
Global KeyDownMap := Map()

; --- KeyDownMap ghost entry cleanup ---
SetTimer(CleanupKeyDownMap, 500)
CleanupKeyDownMap() {
    global KeyDownMap
    keysToRemove := []
    for physKey, _ in KeyDownMap {
        if !GetKeyState(physKey, "P")
            keysToRemove.Push(physKey)
    }
    for _, k in keysToRemove
        KeyDownMap.Delete(k)
}

; --- Fujin Key Definitions (left hand) ---

Global KeyMap := Map(
    "q", {normal: "m", vowel: "e"},
    "w", {normal: "y", vowel: "i"},
    "e", {normal: "r", vowel: "o"},
    "r", {normal: "w", vowel: "a"},
    "t", {normal: "p", vowel: "a"},
    "a", {normal: "k", vowel: "e", isVowelRow: true},
    "s", {normal: "s", vowel: "i", isVowelRow: true},
    "d", {normal: "t", vowel: "o", isVowelRow: true},
    "f", {normal: "n", vowel: "a", isVowelRow: true},
    "g", {normal: "h", vowel: "a", heldOutput: "-"},
    "z", {normal: "z", vowel: "e"},
    "x", {normal: "d", vowel: "i"},
    "c", {normal: "b", vowel: "o", spaceVowel: "u"},
    "v", {normal: "g", vowel: "a"},
    "b", {normal: "j", vowel: "a", spaceVowel: "u"}
)

Global CapsLockMap := Map(
    "q", "f",  "w", "v",  "e", "c",  "r", "q",  "t", "c",
    "a", "g",  "s", "sh", "d", "th", "f", "h",
    "z", "/",  "c", "v",  "v", "f"
)

Global SpaceCapsMap := Map(
    "q", "<", "w", ">", "s", "sh", "z", "{?}"
)

Global SpaceSymbolMap := Map(
    "q", {char: "[", shift: "'"},
    "w", {char: "]", shift: '"'},
    "e", {char: ","},
    "r", {char: "."},
    "g", {char: "-"},
    "t", {char: "="},
    "b", {char: "{+}"},
    "v", {char: "_"},
    "z", {char: "'"},
    "x", {char: '"'}
)

Global CapsSpecialMap := Map(
    "``", "\",
    "1", "{^}", "2", "&", "3", "*", "4", "(", "5", ")",
    "F1", "{F11}", "F2", "{F12}", "F3", "{Insert}", "F4", "{PrintScreen}"
)

; --- Helper Functions ---

IsCtrlOrWinHeld() {
    return GetKeyState("LCtrl", "P") || GetKeyState("RCtrl", "P")
        || GetKeyState("LWin", "P") || GetKeyState("RWin", "P")
}

IsModifierHeld() {
    global LAltUsedAsU
    return IsCtrlOrWinHeld()
        || (GetKeyState("LAlt", "P") && !LAltUsedAsU) || GetKeyState("RAlt", "P")
}

IsSpacePhysicallyHeld() {
    global SpaceHeld
    return SpaceHeld || GetKeyState("Space", "P")
}

IsCapsLockHeld() {
    return GetKeyState("CapsLock", "P")
}

FindCharKeyDown(ExcludeKey := "") {
    for physKey, _ in KeyMap {
        if (physKey != ExcludeKey && KeyDownMap.Has(physKey))
            return physKey
    }
    return ""
}

AnyCharKeyDown(ExcludeKey := "", PhysicalOnly := false) {
    for physKey, _ in KeyMap {
        if (physKey != ExcludeKey) {
            if PhysicalOnly {
                if GetKeyState(physKey, "P")
                    return true
            } else {
                if (GetKeyState(physKey, "P") || KeyDownMap.Has(physKey))
                    return true
            }
        }
    }
    return false
}

ApplyCaseAndSend(char) {
    global LAltUsedAsU
    if LAltUsedAsU {
        if GetKeyState("Shift", "P")
            SendInput "{LAlt Up}+" char
        else
            SendInput "{LAlt Up}" char
    } else {
        SendInput "{Blind}" char
    }
}

SpaceModSend(output) {
    global SpaceUsedAsModifier, SpaceHeld
    SpaceUsedAsModifier := true
    SpaceHeld := true
    SendInput output
}

ResolveVowel(physKey, spaceIsHeld) {
    if !KeyMap.Has(physKey)
        return ""
    targetVowel := KeyMap[physKey].vowel
    if (spaceIsHeld && KeyMap[physKey].HasProp("spaceVowel"))
        targetVowel := KeyMap[physKey].spaceVowel
    return targetVowel
}

; --- Main Character Processor (left hand) ---

ProcessChar(physKey) {
    global SpaceHeld, SpaceUsedAsModifier, LastCharWasVowel

    spaceIsHeld := IsSpacePhysicallyHeld()

    ; Mark Space as modifier early (applies to all Space-held paths)
    if spaceIsHeld {
        SpaceUsedAsModifier := true
        SpaceHeld := true
    }

    ; 1. CapsLock layer (first key only)
    if IsCapsLockHeld() && CapsLockMap.Has(physKey) && !AnyCharKeyDown(physKey) {
        ApplyCaseAndSend(CapsLockMap[physKey])
        return
    }

    ; 2. Space layer (symbols)
    if spaceIsHeld && SpaceSymbolMap.Has(physKey) {
        mapping := SpaceSymbolMap[physKey]
        if mapping.HasProp("shift") && GetKeyState("Shift", "P") {
            SendInput "{LShift Up}{RShift Up}" mapping.shift
            return
        }
        SendInput mapping.char
        return
    }



    ; 4. Vowel coding
    if !KeyMap.Has(physKey)
        return

    heldCharKey := FindCharKeyDown(physKey)
    isVowelRow := KeyMap[physKey].HasProp("isVowelRow")
    vowelMode := spaceIsHeld || (heldCharKey != "" && isVowelRow)

    ; 5. Character output
    if vowelMode {
        char := ResolveVowel(physKey, spaceIsHeld)
        LastCharWasVowel := true
    } else if (heldCharKey != "" && LastCharWasVowel && KeyMap[physKey].HasProp("heldOutput")) {
        char := KeyMap[physKey].heldOutput
        LastCharWasVowel := false
    } else {
        char := KeyMap[physKey].normal
        LastCharWasVowel := false
    }

    ApplyCaseAndSend(char)
}

HandleKeyDown(physKey) {
    if !KeyDownMap.Has(physKey)
        KeyDownMap[physKey] := true
    ProcessChar(physKey)
}

HandleKeyUp(physKey) {
    if KeyDownMap.Has(physKey)
        KeyDownMap.Delete(physKey)
}

HandleCapsKey(physKey) {
    global KeyDownMap, SpaceCapsMode, SpaceUsedAsModifier, SpaceHeld, LastCharWasVowel
    if !KeyDownMap.Has(physKey)
        KeyDownMap[physKey] := true
    ; Space+CapsLock: special mappings
    if SpaceCapsMode && SpaceCapsMap.Has(physKey) {
        SpaceUsedAsModifier := true
        SpaceHeld := true
        ApplyCaseAndSend(SpaceCapsMap[physKey])
        return
    }
    if FindCharKeyDown(physKey) != "" {
        ProcessChar(physKey)
        return
    }
    ; Vowel + heldOutput (e.g., CapsLock+LAlt(u) then G -> "-")
    if LastCharWasVowel && KeyMap.Has(physKey) && KeyMap[physKey].HasProp("heldOutput") {
        LastCharWasVowel := false
        ApplyCaseAndSend(KeyMap[physKey].heldOutput)
        return
    }
    ; Consonant output
    if CapsLockMap.Has(physKey)
        ApplyCaseAndSend(CapsLockMap[physKey])
}

HandleCapsArrow(physKey, arrow) {
    global SpaceCapsMode, SpaceUsedAsModifier, SpaceHeld
    ; Space+CapsLock: output from SpaceCapsMap using {Blind} send
    if SpaceCapsMode && SpaceCapsMap.Has(physKey) {
        SpaceUsedAsModifier := true
        SpaceHeld := true
        ApplyCaseAndSend(SpaceCapsMap[physKey])
        return
    }
    if FindCharKeyDown(physKey) == ""
        SendInput "{Blind}" arrow
    else
        HandleCapsKey(physKey)
}

; *****************************************************************
;  SECTION 1: Right Hand Yamato Remap (大和配列)
; *****************************************************************

#HotIf !IsModifierHeld() && !IsCapsLockHeld()
y::x
#HotIf

#HotIf !IsModifierHeld()
u::l
i::q
o::c
p::'
h::f
j::a
k::o
l::i
n::v
m::u
sc027::e
-::sc027
'::/
,::-
.::,
/::.
#HotIf

; *****************************************************************
;  SECTION 2: Left Hand Fujin Layout (風神配列)
; *****************************************************************


; --- CapsLock + left hand keys (no system modifiers) ---
#HotIf IsCapsLockHeld() && !IsModifierHeld()
*q::HandleCapsKey("q")
*w::HandleCapsKey("w")
*e::HandleCapsKey("e")
*r::HandleCapsKey("r")
*t::HandleCapsKey("t")
*a::HandleCapsArrow("a", "{Left}")
*s::HandleCapsArrow("s", "{Up}")
*d::HandleCapsArrow("d", "{Down}")
*f::HandleCapsArrow("f", "{Right}")
*g::HandleCapsKey("g")
*z::HandleCapsKey("z")
*x::HandleCapsKey("x")
*c::HandleCapsKey("c")
*v::HandleCapsKey("v")

*`:: {
    if GetKeyState("Shift", "P")
        SendInput "{LShift Up}{RShift Up}|"
    else
        SendInput "\"
}
*1::SendInput CapsSpecialMap["1"]
*2::SendInput CapsSpecialMap["2"]
*3::SendInput CapsSpecialMap["3"]
*4::SendInput CapsSpecialMap["4"]
*5::SendInput CapsSpecialMap["5"]
*F1::SendInput CapsSpecialMap["F1"]
*F2::SendInput CapsSpecialMap["F2"]
*F3::SendInput CapsSpecialMap["F3"]
*F4::SendInput CapsSpecialMap["F4"]
#HotIf

; --- Left hand key DOWN (no system modifiers, no CapsLock) ---
#HotIf !IsModifierHeld() && !IsCapsLockHeld()
*q::HandleKeyDown("q")
*w::HandleKeyDown("w")
*e::HandleKeyDown("e")
*r::HandleKeyDown("r")
*t::HandleKeyDown("t")
*a::HandleKeyDown("a")
*s::HandleKeyDown("s")
*d::HandleKeyDown("d")
*f::HandleKeyDown("f")
*g::HandleKeyDown("g")
*z::HandleKeyDown("z")
*x::HandleKeyDown("x")
*c::HandleKeyDown("c")
*v::HandleKeyDown("v")
*b::HandleKeyDown("b")
#HotIf

; --- Left hand key UP ---
; Intentionally global (outside #HotIf): ensures KeyDownMap cleanup even when
; modifiers are pressed/released mid-keystroke. ~ prefix lets native key-up
; pass through. CleanupKeyDownMap timer is a secondary safety net.
~*q Up::HandleKeyUp("q")
~*w Up::HandleKeyUp("w")
~*e Up::HandleKeyUp("e")
~*r Up::HandleKeyUp("r")
~*t Up::HandleKeyUp("t")
~*a Up::HandleKeyUp("a")
~*s Up::HandleKeyUp("s")
~*d Up::HandleKeyUp("d")
~*f Up::HandleKeyUp("f")
~*g Up::HandleKeyUp("g")
~*z Up::HandleKeyUp("z")
~*x Up::HandleKeyUp("x")
~*c Up::HandleKeyUp("c")
~*v Up::HandleKeyUp("v")
~*b Up::HandleKeyUp("b")

; *****************************************************************
;  SECTION 3: Special Keys
; *****************************************************************

; --- CapsLock/CharKey + LAlt = u ---
#HotIf (IsCapsLockHeld() || AnyCharKeyDown(, true)) && !IsCtrlOrWinHeld()
*LAlt:: {
    global LAltUsedAsU, LastCharWasVowel
    LAltUsedAsU := true
    LastCharWasVowel := true
    SendInput "u"
}
#HotIf

; --- LAlt catch-all: ensure native passthrough ---
~*LAlt::return

; --- LAlt Up: reset flag ---
~*LAlt Up:: {
    global LAltUsedAsU
    LAltUsedAsU := false
}

; --- CapsLock handler priority (first match wins in AHK v2) ---
;   1. Shift+CapsLock  = toggle CAPS (must NOT fire when char key held)
;   2. CapsLock alone   = prefix key (waits for next key)

; --- Shift+CapsLock = toggle CapsLock ---
#HotIf GetKeyState("Shift", "P") && !AnyCharKeyDown(, true)
*CapsLock:: {
    global CapsActive
    CapsActive := !CapsActive
    SetCapsLockState CapsActive ? "AlwaysOn" : "AlwaysOff"
    ToolTip CapsActive ? "CAPS ON" : "CAPS OFF"
    SetTimer () => ToolTip(), -1000
}
#HotIf

; --- CapsLock as prefix key ---
#HotIf !IsCtrlOrWinHeld()
*CapsLock:: {
    global SpaceCapsMode
    SpaceCapsMode := IsSpacePhysicallyHeld()
    Send "{Blind}{vkE8}"
    KeyWait "CapsLock"
    SpaceCapsMode := false
}
#HotIf

; --- Space key ---
#HotIf !IsModifierHeld()
*Space:: {
    global SpaceHeld, SpaceUsedAsModifier, SpaceCapsMode

    ; Space+CapsLock mode active: suppress repeat (prevents Backspace deleting output)
    if SpaceCapsMode
        return

    ; CapsLock + Space -> Backspace (only if no char key held)
    if IsCapsLockHeld() && !FindCharKeyDown() {
        SendInput "{Backspace}"
        return
    }

    ; LShift + Space -> Enter
    if GetKeyState("LShift", "P") {
        SendInput "{LShift Up}{Enter}"
        return
    }

    ; Reverse rollover: char down -> Space -> vowel output
    heldKey := FindCharKeyDown()
    if (heldKey != "") {
        vowel := ResolveVowel(heldKey, false)
        ApplyCaseAndSend(vowel)
        SpaceUsedAsModifier := true
        return
    }

    SpaceHeld := true
    SpaceUsedAsModifier := false
}
#HotIf

; --- Space Up: ALWAYS reset state ---
*Space Up:: {
    global SpaceHeld, SpaceUsedAsModifier
    if SpaceHeld && !SpaceUsedAsModifier
        SendInput "{Space}"
    SpaceHeld := false
    SpaceUsedAsModifier := false
}

; --- LCtrl+Space = Delete ---
<^Space::SendInput "{Delete}"

; --- Space + number row ---
#HotIf IsSpacePhysicallyHeld() && !IsModifierHeld()
*1::SpaceModSend("6")
*2::SpaceModSend("7")
*3::SpaceModSend("8")
*4::SpaceModSend("9")
*5::SpaceModSend("0")
*F1::SpaceModSend("{F6}")
*F2::SpaceModSend("{F7}")
*F3::SpaceModSend("{F8}")
*F4::SpaceModSend("{F9}")
*F5::SpaceModSend("{F10}")
*`:: {
    if GetKeyState("Shift", "P")
        SpaceModSend("{LShift Up}{RShift Up};")
    else
        SpaceModSend(":")
}
#HotIf
