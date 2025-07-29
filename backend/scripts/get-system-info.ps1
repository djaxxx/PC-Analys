# Script PowerShell pour collecter les informations système détaillées
# Exécuté côté client pour obtenir les vraies informations du PC

try {
    # CPU
    $cpu = Get-WmiObject -Class Win32_Processor | Select-Object -First 1
    $cpuInfo = @{
        marque = $cpu.Manufacturer
        modèle = $cpu.Name
        cœurs = $cpu.NumberOfCores
        vitesse = "$($cpu.MaxClockSpeed) MHz"
    }

    # RAM
    $ramModules = Get-WmiObject -Class Win32_PhysicalMemory
    $totalRam = ($ramModules | Measure-Object -Property Capacity -Sum).Sum
    $ramInfo = @{
        totale = [math]::Round($totalRam / 1GB, 2).ToString() + " Go"
        utilisée = "Calculé côté serveur"
        type = if ($ramModules[0].MemoryType -eq 26) { "DDR4" } elseif ($ramModules[0].MemoryType -eq 34) { "DDR5" } else { "DDR3" }
        formFactor = if ($ramModules[0].FormFactor -eq 8) { "SODIMM" } else { "UDIMM" }
        slots_total = $ramModules.Count
        slots_libres = 0
    }

    # GPU
    $gpus = Get-WmiObject -Class Win32_VideoController | Where-Object { $_.AdapterRAM -gt 0 }
    $gpuInfo = @()
    foreach ($gpu in $gpus) {
        $gpuInfo += @{
            marque = $gpu.AdapterCompatibility
            modèle = $gpu.Name
            vram = [math]::Round($gpu.AdapterRAM / 1MB, 0).ToString() + " Mo"
        }
    }

    # Stockage
    $disks = Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 }
    $storageInfo = @()
    foreach ($disk in $disks) {
        $storageInfo += @{
            type = "SSD/HDD"
            interface = "SATA/NVMe"
            taille = [math]::Round($disk.Size / 1GB, 2).ToString() + " Go"
            nom = $disk.Caption
        }
    }

    # Assembler toutes les informations
    $systemInfo = @{
        cpu = $cpuInfo
        ram = $ramInfo
        gpu = $gpuInfo
        stockage = $storageInfo
    }

    # Retourner en JSON
    $systemInfo | ConvertTo-Json -Depth 10
} catch {
    # En cas d'erreur, retourner un objet d'erreur
    @{
        error = $_.Exception.Message
        cpu = @{ marque = "Erreur"; modèle = "Erreur"; cœurs = "Erreur"; vitesse = "Erreur" }
        ram = @{ totale = "Erreur"; utilisée = "Erreur"; type = "Erreur"; formFactor = "Erreur"; slots_total = "Erreur"; slots_libres = "Erreur" }
        gpu = @(@{ marque = "Erreur"; modèle = "Erreur"; vram = "Erreur" })
        stockage = @(@{ type = "Erreur"; interface = "Erreur"; taille = "Erreur"; nom = "Erreur" })
    } | ConvertTo-Json -Depth 10
} 