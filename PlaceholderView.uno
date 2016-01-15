using Uno;
using Uno.Graphics;
using Fuse;
using Fuse.Controls;

public class PlaceholderView: Placeholder
{
	float _imageWidth, _imageHeight;

	public float ImageWidth
	{
		get {
			return _imageWidth;
		}

		set {
			_imageWidth = value;
			InvalidateLayout();
		}
	}

	public float ImageHeight
	{
		get {
			return _imageHeight;
		}

		set {
			_imageHeight = value;
			InvalidateLayout();
		}
	}
    
    public override float2 GetMarginSize(float2 fillSize, SizeFlags fillSet)
    {
    	if (_imageWidth == 0 || _imageHeight == 0) return float2(0);
        return float2(fillSize.X, _imageHeight * (fillSize.X / _imageWidth));
    }
}