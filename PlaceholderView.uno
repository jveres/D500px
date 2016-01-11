using Uno;
using Uno.Graphics;
using Fuse;
using Fuse.Controls;

public class PlaceholderView: Placeholder
{
	public float ImageWidth { get; set; }
    public float ImageHeight { get; set; }

    protected override float2 GetContentSize(float2 fillSize, SizeFlags fillSet)
    {
            return float2(ImageWidth, ImageHeight);
    }

    public override float2 GetMarginSize(float2 fillSize, SizeFlags fillSet)
    {
            return float2(fillSize.X, ImageHeight * (fillSize.X / ImageWidth));
    }
}