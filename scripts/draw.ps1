Add-Type -AssemblyName System.Drawing
$imagePath = "assets\images\jobs-banner-android.jpeg"
$img = [System.Drawing.Image]::FromFile($imagePath)
Write-Output ("Width: " + $img.Width + ", Height: " + $img.Height)
$img.Dispose()
