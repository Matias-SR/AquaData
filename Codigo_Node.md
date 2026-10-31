**Anotar el siguiente codigo para poder usar node en los Pc's del DUOC**

**Abrir POWERSHELL, no Git Bash**
**Están divididos por uso**

---

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut("C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Node.js\Node.js.lnk")
$shortcut.TargetPath

---

[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "Machine") + ";C:\Program Files\nodejs",
    "Machine"
)

---

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($userPath -notlike "*C:\Program Files\nodejs*") {
    [Environment]::SetEnvironmentVariable(
        "Path",
        $userPath + ";C:\Program Files\nodejs",
        "User"
    )
}

---