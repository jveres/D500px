using Uno;
using Uno.Graphics;
using Fuse;
using Fuse.Controls;

public class PlaceholderView: Placeholder
{
	float _imageWidth, _imageHeight;

	public float ImageWidth
	{
		get { return _imageWidth; }
		set 
		{
			if (_imageWidth != value)
			{
				_imageWidth = value;
				_invalidateLayout();
			}
		}
	}

	public float ImageHeight
	{
		get { return _imageHeight; }
		set {
			if (_imageHeight != value)
			{
				_imageHeight = value;
				_invalidateLayout();
			}
		}
	}

	internal void _invalidateLayout()
	{
		if (_imageWidth > 0 && _imageHeight > 0) InvalidateLayout();
	}
    
    public override float2 GetMarginSize(float2 fillSize, SizeFlags fillSet)
    {
    	if (_imageWidth == 0 || _imageHeight == 0) return float2(0);
        return float2(fillSize.X, _imageHeight * (fillSize.X / _imageWidth));
    }
}