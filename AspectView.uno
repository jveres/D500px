using Uno;
using Fuse;
using Fuse.Elements;
using Fuse.Controls;

public class AspectView: Panel
{
        public AspectView()
        {
                BoxSizing = BoxSizingMode.FillAspect;
                Visibility = Visibility.Collapsed;
        }

        public float AspectRatio
        {
                get { return Aspect; }
                set
                {
                        if (value != 1f) { // Fuse bug workaround
                                Visibility = Visibility.Visible;
                                Aspect = value;
                        }
                }
        }
}