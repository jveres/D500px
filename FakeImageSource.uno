using Uno;
using Uno.Graphics;
using Uno.UX;
using Fuse;
using Fuse.Resources;
using Fuse.Controls;
using Fuse.Elements;

public class FakeImageSource: ImageSource
{
  float _imageWidth, _imageHeight;

  public float ImageWidth
  {
    get { return _imageWidth; }
    set { _imageWidth = value; }
  }
  
  public float ImageHeight
  {
    get { return _imageHeight; }
    set { _imageHeight = value; }
  }

  public override float SizeDensity { get { return 1f; } }       
  public override int2 PixelSize { get { return int2((int)_imageWidth, (int)_imageHeight); } }
  public override float2 Size { get { return float2(_imageWidth, _imageHeight); } }
  public override texture2D GetTexture() { return null; }
  public override ImageSourceState State { get { return ImageSourceState.Ready; } }
}