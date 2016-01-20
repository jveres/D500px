using Uno;
using Uno.Graphics;
using Fuse;
using Fuse.Designer;
using Fuse.Controls;

public class AspectPlaceholder: Placeholder
{
	public static StyleProperty<AspectPlaceholder, float> AspectRatioProperty = new StyleProperty<AspectPlaceholder, float>(0, OnAspectRatioChanged, SetAspectRatio, GetAspectRatio);
	
	float _aspectratio = 0;
	
	public float AspectRatio
	{
		get { return _aspectratio; }
		set { AspectRatioProperty.Set(this, value); }
	}
	
	static void SetAspectRatio(AspectPlaceholder s, float value) { s._aspectratio = value; }
	static float GetAspectRatio(AspectPlaceholder s) { return s._aspectratio; }
	static void OnAspectRatioChanged(AspectPlaceholder s) { s.InvalidateLayout(); }
    
    public override float2 GetMarginSize(float2 fillSize, SizeFlags fillSet)
    {
        return float2(fillSize.X, fillSize.X * AspectRatio);
    }
}